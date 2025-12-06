/**
 * Solana Kit integration test for the Pythia program.
 *
 * Mirrors tests/pythia_op.ts but sends every instruction through the
 * @solana/kit transaction planner/executor so we exercise the same flow
 * the app uses.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import assert from 'node:assert/strict';

import {
	createSolanaRpc,
	createSolanaRpcSubscriptions,
	sendAndConfirmTransactionFactory,
	createTransactionPlanExecutor,
	setTransactionMessageLifetimeUsingBlockhash,
	type Rpc,
	type SolanaRpcApi,
	type RpcSubscriptions,
	type SolanaRpcSubscriptionsApi,
	type Instruction,
} from '@solana/kit';
import { pipe } from '@solana/functional';
import {
	createTransactionMessage,
	setTransactionMessageFeePayer,
	type BaseTransactionMessage,
	type TransactionMessageWithFeePayer,
} from '@solana/transaction-messages';
import { assertIsSendableTransaction } from '@solana/transactions';
import {
	createTransactionPlanner,
	singleInstructionPlan,
	type TransactionPlanner,
} from '@solana/instruction-plans';
import {
	createKeyPairSignerFromBytes,
	signTransactionMessageWithSigners,
	type KeyPairSigner,
} from '@solana/signers';
import { type Address } from '@solana/addresses';

import {
	makeInitSponsorTransactionPlan,
	makeCreateMarketTransactionPlan,
} from '../src/utils/transactionPlans';
import {
	makeWhitelistSponsorIxAsync,
	makeInitSponsorIxAsync,
	makeInitializeMarketIxAsync,
	makeInitInitializeMarketCompDefIxAsync,
	makeInitInitializeUserPositionCompDefIxAsync,
	makeInitProcessPrivateTradeCompDefIxAsync,
	makeInitUpdateUserPositionCompDefIxAsync,
	makeInitClosePositionCompDefIxAsync,
	makeInitRevealMarketStateCompDefIxAsync,
	makeInitRevealUserPositionCompDefIxAsync,
	makeInitHideMarketStateCompDefIxAsync,
	makeInitViewMarketStateCompDefIxAsync,
	makeInitViewUserPositionCompDefIxAsync,
	type MakeInitSponsorIxAsyncInput,
	type MakeInitializeMarketIxAsyncInput,
	type MakeInitializeMarketEncryptedIxAsyncInput,
	type MakeWhitelistSponsorIxAsyncInput,
	type MakeInitInitializeMarketCompDefIxAsyncInput,
	type MakeInitInitializeUserPositionCompDefIxAsyncInput,
	type MakeInitProcessPrivateTradeCompDefIxAsyncInput,
	type MakeInitUpdateUserPositionCompDefIxAsyncInput,
	type MakeInitClosePositionCompDefIxAsyncInput,
	type MakeInitRevealMarketStateCompDefIxAsyncInput,
	type MakeInitRevealUserPositionCompDefIxAsyncInput,
	type MakeInitHideMarketStateCompDefIxAsyncInput,
	type MakeInitViewMarketStateCompDefIxAsyncInput,
	type MakeInitViewUserPositionCompDefIxAsyncInput,
} from '../src/utils/pythiaInstructionsAsync';
import {
	fetchMxeSnapshot,
	generateComputationOffset,
	generateMxeNonce,
	deriveArciumAccounts,
	deriveMxeAccount,
	deriveCompDefAccount,
	type ArciumCircuitName,
	type MxeSnapshot,
} from '../src/utils/arcium';
import { PYTHIA_PROGRAM_ID } from '../src/config/config';
import { fetchMaybeSponsor, fetchSponsor } from '../../clients/js/src/generated/accounts/sponsor';
import { fetchMaybeMarket, fetchMarket } from '../../clients/js/src/generated/accounts/market';

const RPC_URL = process.env.RPC_URL ?? 'https://api.devnet.solana.com';
const ADMIN_KEYPAIR_PATH =
	process.env.KEYPAIR_PATH ?? path.join(os.homedir(), '.config/solana/id.json');

const QUESTION = 'Will ETH reach $5000 by EOY?';

const MARKET_CONFIG = {
	RESOLUTION_DAYS: 30,
	LIQUIDITY_CAP: BigInt(1_000_000),
	INITIAL_LIQUIDITY_USDC: BigInt(10_000),
	OPP_WINDOW_SECONDS: BigInt(300),
	PUB_WINDOW_SECONDS: BigInt(600),
} as const;

const MXE_RETRY_CONFIG = {
	maxRetries: 10,
	delayMs: 500,
} as const;

type TestContext = {
	rpc: Rpc<SolanaRpcApi>;
	rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
	planner: TransactionPlanner;
	executor: ReturnType<typeof createTransactionPlanExecutor>;
	adminSigner: KeyPairSigner;
	programId: string;
	sponsorName: string;
	sponsorPda: Address;
	marketPda: Address;
	question: string;
	marketArgs: {
		resolutionDate: bigint;
		liquidityCap: bigint;
		initialLiquidityUsdc: bigint;
		oppWindowDuration: bigint;
		pubWindowDuration: bigint;
	};
	mxeSnapshot?: MxeSnapshot;
};

// Unified CompDef input type using the exported inputs from pythiaInstructionsAsync.ts
type AnyCompDefInput =
	| MakeInitInitializeMarketCompDefIxAsyncInput
	| MakeInitInitializeUserPositionCompDefIxAsyncInput
	| MakeInitProcessPrivateTradeCompDefIxAsyncInput
	| MakeInitUpdateUserPositionCompDefIxAsyncInput
	| MakeInitClosePositionCompDefIxAsyncInput
	| MakeInitRevealMarketStateCompDefIxAsyncInput
	| MakeInitRevealUserPositionCompDefIxAsyncInput
	| MakeInitHideMarketStateCompDefIxAsyncInput
	| MakeInitViewMarketStateCompDefIxAsyncInput
	| MakeInitViewUserPositionCompDefIxAsyncInput;

type CompDefBuilderUnified = (accounts: AnyCompDefInput) => Promise<Instruction>;

const COMP_DEF_BUILDERS: Record<ArciumCircuitName, CompDefBuilderUnified> = {
	initialize_market: (accounts) =>
		makeInitInitializeMarketCompDefIxAsync(
			accounts as MakeInitInitializeMarketCompDefIxAsyncInput,
		),
	initialize_user_position: (accounts) =>
		makeInitInitializeUserPositionCompDefIxAsync(
			accounts as MakeInitInitializeUserPositionCompDefIxAsyncInput,
		),
	process_private_trade: (accounts) =>
		makeInitProcessPrivateTradeCompDefIxAsync(
			accounts as MakeInitProcessPrivateTradeCompDefIxAsyncInput,
		),
	update_user_position: (accounts) =>
		makeInitUpdateUserPositionCompDefIxAsync(
			accounts as MakeInitUpdateUserPositionCompDefIxAsyncInput,
		),
	close_position: (accounts) =>
		makeInitClosePositionCompDefIxAsync(accounts as MakeInitClosePositionCompDefIxAsyncInput),
	reveal_market_state: (accounts) =>
		makeInitRevealMarketStateCompDefIxAsync(
			accounts as MakeInitRevealMarketStateCompDefIxAsyncInput,
		),
	reveal_user_position: (accounts) =>
		makeInitRevealUserPositionCompDefIxAsync(
			accounts as MakeInitRevealUserPositionCompDefIxAsyncInput,
		),
	hide_market_state: (accounts) =>
		makeInitHideMarketStateCompDefIxAsync(
			accounts as MakeInitHideMarketStateCompDefIxAsyncInput,
		),
	view_market_state: (accounts) =>
		makeInitViewMarketStateCompDefIxAsync(
			accounts as MakeInitViewMarketStateCompDefIxAsyncInput,
		),
	view_user_position: (accounts) =>
		makeInitViewUserPositionCompDefIxAsync(
			accounts as MakeInitViewUserPositionCompDefIxAsyncInput,
		),
};

const COMP_DEF_CIRCUITS = Object.keys(COMP_DEF_BUILDERS) as ArciumCircuitName[];

async function main() {
	const rpc = createSolanaRpc(RPC_URL);
	const rpcSubscriptions = createSolanaRpcSubscriptions(
		RPC_URL.replace('https://', 'wss://').replace('http://', 'ws://'),
	);
	const adminSigner = await createKeyPairSignerFromBytes(readKeypairBytes(ADMIN_KEYPAIR_PATH));
	const { planner, executor } = await createPlannerAndExecutor(
		rpc,
		rpcSubscriptions,
		adminSigner.address,
	);

	const resolutionDateSec = BigInt(
		Math.floor(Date.now() / 1000) + Number(MARKET_CONFIG.RESOLUTION_DAYS) * 86400,
	);
	const marketArgs = {
		resolutionDate: resolutionDateSec,
		liquidityCap: MARKET_CONFIG.LIQUIDITY_CAP,
		initialLiquidityUsdc: MARKET_CONFIG.INITIAL_LIQUIDITY_USDC,
		oppWindowDuration: MARKET_CONFIG.OPP_WINDOW_SECONDS,
		pubWindowDuration: MARKET_CONFIG.PUB_WINDOW_SECONDS,
	};
	const sponsorName = 'Test Sponsor';
	const sponsorPda = await deriveSponsorAddressFromBuilder(adminSigner, sponsorName);
	const marketPda = await deriveMarketAddressFromBuilder({
		sponsorSigner: adminSigner,
		sponsorAccount: sponsorPda,
		question: QUESTION,
		marketArgs,
	});

	const ctx: TestContext = {
		rpc,
		rpcSubscriptions,
		planner,
		executor,
		adminSigner,
		programId: PYTHIA_PROGRAM_ID,
		sponsorName,
		sponsorPda,
		marketPda,
		question: QUESTION,
		marketArgs,
	};

	console.log('\n[1/5] Initialize computation definitions');
	await initializeCompDefinitions(ctx);
	console.log('[2/5] Fetch MXE snapshot');
	await fetchAndStoreMxeSnapshot(ctx);
	console.log('[3/5] Initialize sponsor account');
	await initSponsorAccount(ctx);
	console.log('[4/5] Whitelist sponsor account');
	await whitelistSponsorAccount(ctx);
	console.log('[5/5] Create and encrypt market');
	await createEncryptedMarket(ctx);

	console.log('\nAll steps completed.');
}

async function initializeCompDefinitions(ctx: TestContext) {
	const mxeAccount = await deriveMxeAccount(ctx.programId);
	for (const circuit of COMP_DEF_CIRCUITS) {
		const builder = COMP_DEF_BUILDERS[circuit];
		const compDefAccount = await deriveCompDefAccount(circuit, ctx.programId);
		try {
			const ix = await builder({
				payer: ctx.adminSigner,
				mxeAccount,
				compDefAccount,
			});
			await ctx.executor(await ctx.planner(singleInstructionPlan(ix)));
			console.log(`  • init_${circuit}_comp_def sent for ${compDefAccount}`);
		} catch (error: any) {
			const message = error?.message ?? String(error);
			if (message.includes('already') || message.includes('initialized')) {
				console.log(`  • init_${circuit}_comp_def already finalized, skipping`);
				continue;
			}
			throw error;
		}
	}
	console.log('  ⚠ Finalizing comp definitions still requires Anchor helpers (TODO)');
}

async function fetchAndStoreMxeSnapshot(ctx: TestContext) {
	let attempt = 0;
	while (attempt < MXE_RETRY_CONFIG.maxRetries) {
		try {
			const snapshot = await fetchMxeSnapshot(ctx.rpc, ctx.programId, 'confirmed');
			ctx.mxeSnapshot = snapshot;
			console.log(
				`  MXE x25519 key: ${Buffer.from(snapshot.x25519PublicKey).toString('hex')}`,
			);
			return;
		} catch (error) {
			attempt += 1;
			if (attempt >= MXE_RETRY_CONFIG.maxRetries) throw error;
			console.warn(
				`  MXE snapshot unavailable (attempt ${attempt}/${MXE_RETRY_CONFIG.maxRetries}), retrying...`,
			);
			await sleep(MXE_RETRY_CONFIG.delayMs);
		}
	}
}

async function initSponsorAccount(ctx: TestContext) {
	const existingSponsor = await fetchMaybeSponsor(ctx.rpc, ctx.sponsorPda).catch(() => null);
	if (existingSponsor) {
		console.log('  Sponsor account already exists, asserting state...');
		assert.equal(existingSponsor.data.name, ctx.sponsorName);
		return;
	}

	const input: MakeInitSponsorIxAsyncInput = {
		authority: ctx.adminSigner,
		name: ctx.sponsorName,
	};
	const plan = await makeInitSponsorTransactionPlan(ctx.planner, input);
	await ctx.executor(plan);

	const sponsorAccount = await fetchSponsor(ctx.rpc, ctx.sponsorPda);
	assert.equal(sponsorAccount.data.name, ctx.sponsorName);
	assert.equal(sponsorAccount.data.isWhitelisted, false);
	console.log(`  Sponsor initialized at ${ctx.sponsorPda}`);
}

async function whitelistSponsorAccount(ctx: TestContext) {
	const sponsorAccount = await fetchSponsor(ctx.rpc, ctx.sponsorPda);
	if (sponsorAccount.data.isWhitelisted) {
		console.log('  Sponsor already whitelisted, skipping');
		return;
	}

	const whitelistInput: MakeWhitelistSponsorIxAsyncInput = {
		admin: ctx.adminSigner,
		sponsor: ctx.sponsorPda,
	};
	const whitelistIx = await makeWhitelistSponsorIxAsync(whitelistInput);
	await ctx.executor(await ctx.planner(singleInstructionPlan(whitelistIx)));

	const updatedSponsor = await fetchSponsor(ctx.rpc, ctx.sponsorPda);
	assert.equal(updatedSponsor.data.isWhitelisted, true);
	console.log(`  Sponsor ${ctx.sponsorPda} whitelisted`);
}

async function createEncryptedMarket(ctx: TestContext) {
	const marketAccount = await fetchMaybeMarket(ctx.rpc, ctx.marketPda).catch(() => null);
	if (marketAccount) {
		console.log('  Market already initialized, asserting metadata...');
		assert.equal(marketAccount.data.question, ctx.question);
		assert.equal(
			marketAccount.data.initialLiquidityUsdc.toString(),
			ctx.marketArgs.initialLiquidityUsdc.toString(),
		);
		return;
	}

	const snapshot = ctx.mxeSnapshot;
	if (!snapshot) {
		throw new Error('MXE snapshot missing; run fetch MXE snapshot before creating market.');
	}
	const computationOffset = generateComputationOffset();
	const mxeNonce = generateMxeNonce();
	const arciumAccounts = await deriveArciumAccounts({
		computationOffset,
		circuit: 'initialize_market',
		programId: ctx.programId,
		snapshot,
	});

	const initializeMarketInput: MakeInitializeMarketIxAsyncInput = {
		sponsor: ctx.adminSigner,
		sponsorAccount: ctx.sponsorPda,
		question: ctx.question,
		resolutionDate: ctx.marketArgs.resolutionDate,
		liquidityCap: ctx.marketArgs.liquidityCap,
		initialLiquidityUsdc: ctx.marketArgs.initialLiquidityUsdc,
		oppWindowDuration: ctx.marketArgs.oppWindowDuration,
		pubWindowDuration: ctx.marketArgs.pubWindowDuration,
	};

	const initializeMarketEncryptedInput: MakeInitializeMarketEncryptedIxAsyncInput = {
		payer: ctx.adminSigner,
		market: ctx.marketPda, // IS THIS CORRECT?
		mxeAccount: arciumAccounts.mxeAccount,
		mempoolAccount: arciumAccounts.mempoolAccount,
		executingPool: arciumAccounts.executingPoolAccount,
		computationAccount: arciumAccounts.computationAccount,
		compDefAccount: arciumAccounts.compDefAccount,
		clusterAccount: arciumAccounts.clusterAccount,
		computationOffset,
		initialLiquidityUsdc: ctx.marketArgs.initialLiquidityUsdc,
		mxeNonce: mxeNonce.value,
	};

	const plan = await makeCreateMarketTransactionPlan(ctx.planner, {
		initializeMarket: initializeMarketInput,
		initializeMarketEncrypted: initializeMarketEncryptedInput,
	});
	await ctx.executor(plan);

	const createdMarket = await fetchMarket(ctx.rpc, ctx.marketPda);
	assert.equal(createdMarket.data.question, ctx.question);
	assert.equal(createdMarket.data.sponsor.toString(), ctx.sponsorPda.toString());
	assert.equal(
		createdMarket.data.initialLiquidityUsdc.toString(),
		ctx.marketArgs.initialLiquidityUsdc.toString(),
	);
	assert.notEqual(createdMarket.data.nonce, BigInt(0));
	console.log(
		`  Market initialized. Nonce=${createdMarket.data.nonce.toString()} | Window=${
			createdMarket.data.windowState
		}`,
	);
	console.log('  ⚠ Computation finalization polling is still TODO in app/src/utils/arcium.ts');
}

function readKeypairBytes(filePath: string): Uint8Array {
	const raw = fs.readFileSync(path.resolve(filePath), 'utf-8');
	return new Uint8Array(JSON.parse(raw));
}

async function createPlannerAndExecutor(
	rpc: Rpc<SolanaRpcApi>,
	rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
	feePayerAddress: Address,
) {
	const planner: TransactionPlanner = createTransactionPlanner({
		createTransactionMessage: () =>
			pipe(createTransactionMessage({ version: 0 }), (msg) =>
				setTransactionMessageFeePayer(feePayerAddress, msg),
			),
		onTransactionMessageUpdated: (message) => message,
	});

	const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

	const executor = createTransactionPlanExecutor({
		executeTransactionMessage: async (
			message: BaseTransactionMessage & TransactionMessageWithFeePayer,
			config?: { abortSignal?: AbortSignal },
		) => {
			const {
				value: { blockhash, lastValidBlockHeight },
			} = await rpc.getLatestBlockhash().send();
			const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
				{ blockhash, lastValidBlockHeight },
				message,
			);
			const signedTx = await signTransactionMessageWithSigners(messageWithLifetime, {
				abortSignal: config?.abortSignal,
			});
			assertIsSendableTransaction(signedTx);
			await sendAndConfirm(signedTx as any, {
				commitment: 'confirmed',
				abortSignal: config?.abortSignal,
			});
			return { transaction: signedTx };
		},
	});
	return { planner, executor };
}

async function deriveSponsorAddressFromBuilder(
	authority: KeyPairSigner,
	sponsorName: string,
): Promise<Address> {
	const input: MakeInitSponsorIxAsyncInput = {
		authority,
		name: sponsorName,
	};
	const ix = await makeInitSponsorIxAsync(input);
	const sponsorMeta = ix.accounts[1];
	if (!sponsorMeta?.address) {
		throw new Error('Failed to derive sponsor PDA from async builder.');
	}
	return sponsorMeta.address as Address;
}

async function deriveMarketAddressFromBuilder(params: {
	sponsorSigner: KeyPairSigner;
	sponsorAccount: Address;
	question: string;
	marketArgs: TestContext['marketArgs'];
}): Promise<Address> {
	const ix = await makeInitializeMarketIxAsync({
		sponsor: params.sponsorSigner,
		sponsorAccount: params.sponsorAccount,
		question: params.question,
		resolutionDate: params.marketArgs.resolutionDate,
		liquidityCap: params.marketArgs.liquidityCap,
		initialLiquidityUsdc: params.marketArgs.initialLiquidityUsdc,
		oppWindowDuration: params.marketArgs.oppWindowDuration,
		pubWindowDuration: params.marketArgs.pubWindowDuration,
	});
	const marketMeta = ix.accounts[2];
	if (!marketMeta?.address) {
		throw new Error('Failed to derive market PDA from async builder.');
	}
	return marketMeta.address as Address;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

main().catch((error) => {
	console.error('Script failed:', error);
	process.exitCode = 1;
});
