/**
 * Testnet bootstrap checklist:
 *
 * 1. Initialize every Arcium computation definition PDA on the target cluster.
 *    - Call `init_initialize_market_comp_def`.
 *    - Call `init_initialize_user_position_comp_def`.
 *    - Call `init_process_private_trade_comp_def`.
 *    - Call `init_update_user_position_comp_def`.
 *    - Call `init_close_position_comp_def`.
 *    - Call `init_reveal_market_state_comp_def`.
 *    - Call `init_reveal_user_position_comp_def`.
 *    - Call `init_hide_market_state_comp_def`.
 *    - Call `init_view_market_state_comp_def`.
 *    - Call `init_view_user_position_comp_def`.
 *
 * 2. Create and whitelist at least one sponsor.
 *    - Load the sponsor authority keypair (do NOT assume ~/.config/solana/id.json; accept a CLI path or key).
 *    - Run `init_sponsor` with that signer and a sponsor name.
 *    - Immediately run `whitelist_sponsor` so `init_market` will succeed.
 *
 * 3. Seed one or more markets so the UI/indexer has data.
 *    - Run `init_market` with the sponsor signer.
 *    - Run `init_market_encrypted` using a computation offset + MXE nonce (see `app/src/utils/arcium.ts` helpers).
 *    - Optionally queue `switch_to_public` / `switch_to_private` so both windows exist.
 *
 * 4. Indexer/backends must be aware of these actions.
 *    - After bootstrapping, inform the indexer (or rerun its backfill) so it ingests the sponsor PDA,
 *      market accounts, and emitted events. Without indexing, the app hooks will still see empty data.
 *
 * 5. Script expectations.
 *    - Accept RPC URL, wallet path/secret, sponsor metadata, and market metadata via CLI/env.
 *    - Use the generated client + transaction planner (`app/src/utils/transactionPlans.ts`) to submit txns.
 *    - Fail fast if any prerequisite (Arcium accounts, whitelist, indexer sync) is missing.
 */

import fs from 'fs';
import path from 'path';

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
} from '@solana/kit';
import {
	createTransactionPlanner,
	singleInstructionPlan,
	type TransactionPlanner,
} from '@solana/instruction-plans';
import { pipe } from '@solana/functional';
import {
	createTransactionMessage,
	setTransactionMessageFeePayer,
	type BaseTransactionMessage,
	type TransactionMessageWithFeePayer,
} from '@solana/transaction-messages';
import { compileTransaction, assertIsSendableTransaction } from '@solana/transactions';
import { address as toAddress, type Address } from '@solana/addresses';
import {
	createKeyPairSignerFromBytes,
	signTransactionMessageWithSigners,
	type KeyPairSigner,
} from '@solana/signers';

import {
	makeInitSponsorTransactionPlan,
	makeCreateMarketTransactionPlan,
	makeSwitchToPublicTransactionPlan,
	makeSwitchToPrivateTransactionPlan,
} from '../app/src/utils/transactionPlans';
import {
	makeWhitelistSponsorIxAsync,
	type MakeInitializeMarketIxAsyncInput,
	type MakeInitializeMarketEncryptedIxAsyncInput,
	type MakeSwitchToPublicIxAsyncInput,
	type MakeSwitchToPrivateIxAsyncInput,
	type MakeInitSponsorIxAsyncInput,
	type MakeWhitelistSponsorIxAsyncInput,
} from '../app/src/utils/pythiaInstructionsAsync';
import { deriveSponsorPda, deriveMarketPda } from '../app/src/utils/pythiaAccounts';
import {
	fetchMxeSnapshot,
	generateComputationOffset,
	generateMxeNonce,
	deriveArciumAccounts,
	type ArciumCircuitName,
} from '../app/src/utils/arcium';
import { PYTHIA_PROGRAM_ID } from '../app/src/config/config';

// For comp-def finalization and computation finalization.
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, Keypair, Connection, Transaction } from '@solana/web3.js';
import {
	buildFinalizeCompDefTx,
	getCompDefAccOffset,
	awaitComputationFinalization,
} from '@arcium-hq/client';

// ================
// Hard-coded config
// ================

const RPC_URL = 'https://api.devnet.solana.com';
const ADMIN_KEYPAIR_PATH = `${process.env.HOME}/.config/solana/id.json`;

const SPONSOR = {
	name: 'Acme Capital',
};

const MARKETS: ReadonlyArray<{
	question: string;
	resolutionDateSec: number;
	liquidityCap: bigint;
	initialLiquidityUsdc: bigint;
	oppWindowDuration: bigint;
	pubWindowDuration: bigint;
	windowSwitch?: 'public' | 'private';
}> = [
	{
		question: 'Will we fund Startup X within 6 months?',
		resolutionDateSec: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
		liquidityCap: BigInt(1_000_000),
		initialLiquidityUsdc: BigInt(100_000),
		oppWindowDuration: BigInt(60 * 5),
		pubWindowDuration: BigInt(60 * 10),
		windowSwitch: 'public',
	},
];

// ==========================
// Minimal execution plumbing
// ==========================

function readKeypairBytes(filePath: string): Uint8Array {
	const abs = path.resolve(filePath);
	const raw = fs.readFileSync(abs, { encoding: 'utf-8' });
	return new Uint8Array(JSON.parse(raw));
}

async function createPlannerAndExecutor(
	rpc: Rpc<SolanaRpcApi>,
	rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>,
	feePayerAddress: Address,
) {
	const planner: TransactionPlanner = createTransactionPlanner({
		createTransactionMessage: () =>
			pipe(
				createTransactionMessage({ version: 0 }),
				(m) => setTransactionMessageFeePayer(feePayerAddress, m),
				// Optional: add a provisional CU-limit instruction if needed.
				(m) => m,
			),
		onTransactionMessageUpdated: (m) => m,
	});

	const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

	const executor = createTransactionPlanExecutor({
		executeTransactionMessage: async (
			message: BaseTransactionMessage & TransactionMessageWithFeePayer,
			config?: { abortSignal?: AbortSignal },
		) => {
			// Blockhash lifetime
			const {
				value: { blockhash, lastValidBlockHeight },
			} = await rpc.getLatestBlockhash().send();
			const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
				{ blockhash, lastValidBlockHeight },
				message,
			);

			// Sign
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

// ==========================
// Comp-def initialization
// ==========================

const COMP_DEF_CIRCUITS: ArciumCircuitName[] = [
	'initialize_market',
	'initialize_user_position',
	'process_private_trade',
	'update_user_position',
	'close_position',
	'reveal_market_state',
	'reveal_user_position',
	'hide_market_state',
	'view_market_state',
	'view_user_position',
];

async function initAndFinalizeCompDefs(args: {
	adminSigner: KeyPairSigner;
	rpc: Rpc<SolanaRpcApi>;
	rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
	connection: Connection;
	programId: string;
}) {
	const { adminSigner, rpc, rpcSubscriptions, connection, programId } = args;
	// Anchor provider for finalize/follow-up helpers that require it.
	const kpBytes = await (async () => {
		// createKeyPairSignerFromBytes is backed by SubtleCrypto; reconstruct Keypair for Anchor.
		const pkJson = readKeypairBytes(ADMIN_KEYPAIR_PATH);
		return pkJson;
	})();
	const adminKeypair = Keypair.fromSecretKey(kpBytes);
	const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(adminKeypair), {
		commitment: 'confirmed',
	});

	// Derive MXE account (used by all comp-def init calls).
	// Using our fetch helper to ensure MXE exists before proceeding.
	let snapshot;
	for (let attempt = 1; attempt <= 5; attempt += 1) {
		try {
			snapshot = await fetchMxeSnapshot(rpc, programId);
			break;
		} catch (e) {
			if (attempt === 5) throw e;
			console.warn(`MXE snapshot unavailable — retry ${attempt}/4 in 500ms`);
			await new Promise((r) => setTimeout(r, 500));
		}
	}
	if (!snapshot) throw new Error('Failed to fetch MXE snapshot; aborting comp-def init.');

	// Initialize each comp-def then finalize it.
	for (const circuit of COMP_DEF_CIRCUITS) {
		const start = Date.now();
		console.log(`▶️  Init comp-def (${circuit})`);
		try {
			// Resolve compDef and mxe accounts.
			const compDefAccount = await (
				await import('../app/src/utils/arcium')
			).deriveCompDefAccount(circuit);
			const mxeAccount = snapshot.address;

			// Build the init instruction for this circuit.
			const makeFnName = (() => {
				switch (circuit) {
					case 'initialize_market':
						return 'makeInitInitializeMarketCompDefIxAsync';
					case 'initialize_user_position':
						return 'makeInitInitializeUserPositionCompDefIxAsync';
					case 'process_private_trade':
						return 'makeInitProcessPrivateTradeCompDefIxAsync';
					case 'update_user_position':
						return 'makeInitUpdateUserPositionCompDefIxAsync';
					case 'close_position':
						return 'makeInitClosePositionCompDefIxAsync';
					case 'reveal_market_state':
						return 'makeInitRevealMarketStateCompDefIxAsync';
					case 'reveal_user_position':
						return 'makeInitRevealUserPositionCompDefIxAsync';
					case 'hide_market_state':
						return 'makeInitHideMarketStateCompDefIxAsync';
					case 'view_market_state':
						return 'makeInitViewMarketStateCompDefIxAsync';
					case 'view_user_position':
						return 'makeInitViewUserPositionCompDefIxAsync';
				}
			})();
			// Dynamically import to avoid bundling everything twice.
			const builders = await import('../app/src/utils/pythiaInstructionsAsync');
			const ix = await (builders as any)[makeFnName]({
				payer: adminSigner,
				mxeAccount,
				compDefAccount,
			});

			// Plan and execute single-instruction txn.
			const rpcLocal = rpc;
			const rpcSubs = rpcSubscriptions;
			const { planner, executor } = await createPlannerAndExecutor(
				rpcLocal,
				rpcSubs,
				adminSigner.address,
			);
			const plan = singleInstructionPlan(ix);
			await executor(await planner(plan));
			console.log(`✅ Init comp-def (${circuit}) — sent (${Date.now() - start}ms)`);

			// Finalize comp-def using Arcium helper (Anchor transaction).
			const offsetBuf = getCompDefAccOffset(circuit as any);
			const offset = Buffer.from(offsetBuf).readUInt32LE(0);
			const finalizeTx = await buildFinalizeCompDefTx(
				provider as any,
				offset,
				new PublicKey(programId),
			);
			const latest = await connection.getLatestBlockhash('confirmed');
			finalizeTx.recentBlockhash = latest.blockhash;
			finalizeTx.lastValidBlockHeight = latest.lastValidBlockHeight;
			finalizeTx.feePayer = adminKeypair.publicKey;
			finalizeTx.sign(adminKeypair);
			const sig = await connection.sendRawTransaction(finalizeTx.serialize(), {
				skipPreflight: true,
				preflightCommitment: 'confirmed',
			});
			await connection.confirmTransaction(
				{
					signature: sig,
					blockhash: latest.blockhash,
					lastValidBlockHeight: latest.lastValidBlockHeight,
				},
				'confirmed',
			);
			console.log(`✅ Finalize comp-def (${circuit}) — tx ${sig}`);
		} catch (e: any) {
			const msg = e?.message ?? String(e);
			// Treat "already initialized" as non-fatal.
			if (msg.includes('already') || msg.includes('initialized') || msg.includes('exists')) {
				console.log(`ℹ️  Comp-def (${circuit}) already initialized/finalized — continuing`);
				continue;
			}
			console.error(`❌ Init/finalize comp-def (${circuit}) failed: ${msg}`);
			throw e;
		}
	}
}

// ==========================
// Bootstrap sponsor + markets
// ==========================

async function main() {
	const startAll = Date.now();
	console.log('=== Pythia — Testnet bootstrap start ===');
	console.log(`RPC: ${RPC_URL}`);
	console.log(`Keypair: ${ADMIN_KEYPAIR_PATH}`);

	// RPC + subscriptions
	const rpc = createSolanaRpc(RPC_URL);
	const rpcSubscriptions = createSolanaRpcSubscriptions(
		RPC_URL.replace('https://', 'wss://').replace('http://', 'ws://'),
	);

	// Load admin keypair signer (used as fee payer and instruction signer).
	const adminKeypairBytes = readKeypairBytes(ADMIN_KEYPAIR_PATH);
	const adminSigner = await createKeyPairSignerFromBytes(adminKeypairBytes);

	// Planner/executor bound to admin address.
	const { planner, executor } = await createPlannerAndExecutor(
		rpc,
		rpcSubscriptions,
		adminSigner.address,
	);

	// Web3/Anchor connection for Arcium finalize + computation awaiting.
	const connection = new Connection(RPC_URL, 'confirmed');

	// Step 1 — Initialize & finalize comp defs
	console.log('\n--- Step 1 — Initialize Arcium computation definitions ---');
	await initAndFinalizeCompDefs({
		adminSigner,
		rpc,
		rpcSubscriptions,
		connection,
		programId: PYTHIA_PROGRAM_ID,
	});

	// Step 2 — Create and whitelist sponsor
	console.log('\n--- Step 2 — Create + whitelist sponsor ---');
	try {
	const initSponsorInput: MakeInitSponsorIxAsyncInput = {
		authority: adminSigner,
		name: SPONSOR.name,
	};
	const plan = await makeInitSponsorTransactionPlan(planner, initSponsorInput);
		await executor(plan);
		console.log(`✅ init_sponsor — authority=${adminSigner.address}`);
	} catch (e: any) {
		const msg = e?.message ?? String(e);
		if (msg.includes('already') || msg.includes('exists')) {
			console.log('ℹ️  Sponsor already initialized — continuing');
		} else {
			console.error(`❌ init_sponsor failed: ${msg}`);
			throw e;
		}
	}

	// Derive sponsor PDA for whitelisting + market derivations.
	const sponsorPda = await deriveSponsorPda(adminSigner.address, PYTHIA_PROGRAM_ID);
	try {
	const whitelistInput: MakeWhitelistSponsorIxAsyncInput = {
		admin: adminSigner,
		sponsor: sponsorPda,
	};
	const whitelistIx = await makeWhitelistSponsorIxAsync(whitelistInput);
		await executor(await planner(singleInstructionPlan(whitelistIx)));
		console.log(`✅ whitelist_sponsor — sponsor=${sponsorPda}`);
	} catch (e: any) {
		const msg = e?.message ?? String(e);
		if (msg.includes('already') || msg.includes('exists') || msg.includes('whitelisted')) {
			console.log('ℹ️  Sponsor already whitelisted — continuing');
		} else {
			console.error(`❌ whitelist_sponsor failed: ${msg}`);
			throw e;
		}
	}

	// Step 3 — Seed markets
	console.log('\n--- Step 3 — Seed markets ---');
	const createdMarkets: string[] = [];
	for (const m of MARKETS) {
		const mkStart = Date.now();
		console.log(`▶️  Create market — "${m.question}"`);
		try {
			// Derive market PDA (used by both init_market and init_market_encrypted).
			const marketPda = await deriveMarketPda(sponsorPda, m.question, PYTHIA_PROGRAM_ID);

			// Fetch MXE snapshot (retry up to 5 times for eventual consistency).
			let snapshot;
			for (let attempt = 1; attempt <= 5; attempt += 1) {
				try {
					snapshot = await fetchMxeSnapshot(rpc, PYTHIA_PROGRAM_ID);
					break;
				} catch (e) {
					if (attempt === 5) throw e;
					console.warn(`  ⟲ MXE snapshot retry ${attempt}/4 in 500ms`);
					await new Promise((r) => setTimeout(r, 500));
				}
			}
			if (!snapshot) throw new Error('MXE snapshot missing; cannot create market.');

			// Derive Arcium accounts and offsets.
			const computationOffset = generateComputationOffset();
			const { value: mxeNonce } = generateMxeNonce();
			const arciumAccounts = await deriveArciumAccounts({
				computationOffset,
				circuit: 'initialize_market',
				snapshot,
				programId: PYTHIA_PROGRAM_ID,
			});

			// Build plan params
			const initMarketInput: MakeInitializeMarketIxAsyncInput = {
				sponsor: adminSigner,
				sponsorAccount: sponsorPda,
				market: marketPda,
				question: m.question,
				resolutionDate: BigInt(m.resolutionDateSec),
				liquidityCap: m.liquidityCap,
				initialLiquidityUsdc: m.initialLiquidityUsdc,
				oppWindowDuration: m.oppWindowDuration,
				pubWindowDuration: m.pubWindowDuration,
			};

			const initMarketEncryptedInput: MakeInitializeMarketEncryptedIxAsyncInput = {
				payer: adminSigner,
				market: marketPda,
				signPdaAccount: arciumAccounts.signPdaAccount,
				mxeAccount: arciumAccounts.mxeAccount,
				mempoolAccount: arciumAccounts.mempoolAccount,
				executingPool: arciumAccounts.executingPoolAccount,
				computationAccount: arciumAccounts.computationAccount,
				compDefAccount: arciumAccounts.compDefAccount,
				clusterAccount: arciumAccounts.clusterAccount,
				poolAccount: arciumAccounts.feePoolAccount,
				clockAccount: arciumAccounts.clockAccount,
				computationOffset,
				initialLiquidityUsdc: m.initialLiquidityUsdc,
				mxeNonce,
			};

			// Execute plan (sequential: init_market then init_market_encrypted)
			const createPlan = await makeCreateMarketTransactionPlan(planner, {
				initializeMarket: initMarketInput,
				initializeMarketEncrypted: initMarketEncryptedInput,
			});
			await executor(createPlan);

			// Wait for Arcium computation finalization for the encrypted init
			const provider = new anchor.AnchorProvider(
				connection,
				new anchor.Wallet(Keypair.fromSecretKey(adminKeypairBytes)),
				{
					commitment: 'confirmed',
				},
			);
			await awaitComputationFinalization(
				provider as any,
				new anchor.BN(computationOffset.toString()),
				new PublicKey(PYTHIA_PROGRAM_ID),
				'confirmed',
			);
			console.log(`✅ Created market: ${marketPda} (${Date.now() - mkStart}ms)`);
			createdMarkets.push(marketPda as unknown as string);

			// Optional window switch
			if (m.windowSwitch) {
				const switchStart = Date.now();
				const switchCircuit: ArciumCircuitName =
					m.windowSwitch === 'public' ? 'reveal_market_state' : 'hide_market_state';
				const switchOffset = generateComputationOffset();
				const switchArcium = await deriveArciumAccounts({
					computationOffset: switchOffset,
					circuit: switchCircuit,
					snapshot,
					programId: PYTHIA_PROGRAM_ID,
				});
				if (m.windowSwitch === 'public') {
				const switchInput: MakeSwitchToPublicIxAsyncInput = {
					payer: adminSigner,
					market: marketPda,
					signPdaAccount: switchArcium.signPdaAccount,
					mxeAccount: switchArcium.mxeAccount,
					mempoolAccount: switchArcium.mempoolAccount,
					executingPool: switchArcium.executingPoolAccount,
					computationAccount: switchArcium.computationAccount,
					compDefAccount: switchArcium.compDefAccount,
					clusterAccount: switchArcium.clusterAccount,
					poolAccount: switchArcium.feePoolAccount,
					clockAccount: switchArcium.clockAccount,
					computationOffset: switchOffset,
				};
				await executor(
					await makeSwitchToPublicTransactionPlan(planner, switchInput),
				);
					await awaitComputationFinalization(
						provider as any,
						new anchor.BN(switchOffset.toString()),
						new PublicKey(PYTHIA_PROGRAM_ID),
						'confirmed',
					);
					console.log(`  ↳ Switched window to PUBLIC (${Date.now() - switchStart}ms)`);
				} else {
				const switchInput: MakeSwitchToPrivateIxAsyncInput = {
					payer: adminSigner,
					market: marketPda,
					signPdaAccount: switchArcium.signPdaAccount,
					mxeAccount: switchArcium.mxeAccount,
					mempoolAccount: switchArcium.mempoolAccount,
					executingPool: switchArcium.executingPoolAccount,
					computationAccount: switchArcium.computationAccount,
					compDefAccount: switchArcium.compDefAccount,
					clusterAccount: switchArcium.clusterAccount,
					poolAccount: switchArcium.feePoolAccount,
					clockAccount: switchArcium.clockAccount,
					computationOffset: switchOffset,
					mxeNonce: generateMxeNonce().value,
				};
				await executor(
					await makeSwitchToPrivateTransactionPlan(planner, switchInput),
				);
					await awaitComputationFinalization(
						provider as any,
						new anchor.BN(switchOffset.toString()),
						new PublicKey(PYTHIA_PROGRAM_ID),
						'confirmed',
					);
					console.log(`  ↳ Switched window to PRIVATE (${Date.now() - switchStart}ms)`);
				}
			}
		} catch (e: any) {
			console.error(`❌ Create market failed — "${m.question}": ${e?.message ?? String(e)}`);
			throw e;
		}
	}

	// Step 4 — (Optional) Resolve market (example)
	// console.log('\n--- Step 4 — Resolve market (example) ---');
	// const resolvePlan = await makeResolveMarketTransactionPlan(planner, {
	// 	authority: adminSigner,
	// 	market: createdMarkets[0] as any,
	// 	outcome: true,
	// });
	// await executor(resolvePlan);

	// Step 5 — Indexer/backends reminder
	console.log('\n--- Step 5 — Indexer reminder ---');
	console.log('ℹ️  If you run an indexer, trigger a backfill for:');
	console.log(`    - Sponsor PDA: ${sponsorPda}`);
	for (const addr of createdMarkets) console.log(`    - Market PDA:  ${addr}`);

	console.log(`\n✅ Bootstrap complete in ${Date.now() - startAll}ms`);
}

// Execute when invoked directly
main().catch((e) => {
	console.error('❌ Bootstrap failed:', e?.message ?? String(e));
	process.exit(1);
});
