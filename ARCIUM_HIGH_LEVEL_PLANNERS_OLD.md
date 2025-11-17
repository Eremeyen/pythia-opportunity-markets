# Archived Arcium high-level planners

Previous implementations that lived in `app/src/utils/transactionPlans.ts` before being replaced with TODOs. Copy/paste as needed.

```ts
// Imports these depended on:
import { type TransactionPlan, type TransactionPlanner } from '@solana/instruction-plans';
import type { Rpc, SolanaRpcApi } from '@solana/kit';
import { address as toAddress, type Address } from '@solana/addresses';
import {
	AccountRole,
	type ReadonlyAccount,
	type WritableAccount,
	type WritableSignerAccount,
} from '@solana/instructions';
import { PYTHIA_PROGRAM_ID } from '../config/config';
import {
	SYSTEM_PROGRAM,
	deriveArciumAccounts,
	encryptArciumPayload,
	fetchMxeSnapshot,
	generateComputationOffset,
	generateMxeNonce,
} from './arcium';
import { deriveMarketPda, deriveSponsorPda, deriveUserPositionPda } from './pythiaAccounts';
import type {
	MakeInitializeMarketEncryptedIxAccounts,
	MakeInitializeMarketEncryptedIxArguments,
	MakeInitializeMarketIxAccounts,
	MakePrivateTradeIxAccounts,
	MakeUpdateUserPositionPrivateIxAccounts,
} from './pythiaInstructions';
// Uses CreateMarketPlanParams and PrivateTradePlanParams defined earlier in transactionPlans.ts.
```

```ts
export type CreateMarketWithArciumParams = Readonly<{
	planner: TransactionPlanner;
	rpc: Rpc<SolanaRpcApi>;
	sponsorAuthority: Address | string;
	question: string;
	resolutionDate: bigint;
	liquidityCap: bigint;
	initialLiquidityUsdc: bigint;
	oppWindowDuration: bigint;
	pubWindowDuration: bigint;
	sponsorAccountAddress?: Address | string;
	marketAddress?: Address | string;
	programId?: string;
}>;

export const planCreateMarketWithArcium = async (
	params: CreateMarketWithArciumParams,
): Promise<TransactionPlan> => {
	const programId = params.programId ?? PYTHIA_PROGRAM_ID;
	const sponsorAuthorityAddress = asAddress(params.sponsorAuthority);
	const sponsorAccountAddress =
		params.sponsorAccountAddress !== undefined
			? asAddress(params.sponsorAccountAddress)
			: await deriveSponsorPda(sponsorAuthorityAddress, programId);
	const marketAddress =
		params.marketAddress !== undefined
			? asAddress(params.marketAddress)
			: await deriveMarketPda(sponsorAccountAddress, params.question, programId);

	const computationOffset = generateComputationOffset();
	const { value: mxeNonce } = generateMxeNonce();
	const snapshot = await fetchMxeSnapshot(params.rpc, programId);
	const arciumAccounts = await deriveArciumAccounts({
		computationOffset,
		circuit: 'initialize_market',
		snapshot,
		programId,
	});

	const initialLiquidity = params.initialLiquidityUsdc;
	const initializeMarketAccounts: MakeInitializeMarketIxAccounts = [
		writableSignerAccountMeta(sponsorAuthorityAddress),
		writableAccountMeta(sponsorAccountAddress),
		writableAccountMeta(marketAddress),
		readonlyAccountMeta(SYSTEM_PROGRAM),
	];

	const initializeMarketEncryptedAccounts: MakeInitializeMarketEncryptedIxAccounts = [
		writableSignerAccountMeta(sponsorAuthorityAddress),
		writableAccountMeta(marketAddress),
		writableAccountMeta(arciumAccounts.signPdaAccount),
		readonlyAccountMeta(arciumAccounts.mxeAccount),
		writableAccountMeta(arciumAccounts.mempoolAccount),
		writableAccountMeta(arciumAccounts.executingPoolAccount),
		writableAccountMeta(arciumAccounts.computationAccount),
		readonlyAccountMeta(arciumAccounts.compDefAccount),
		writableAccountMeta(arciumAccounts.clusterAccount),
		writableAccountMeta(arciumAccounts.feePoolAccount),
		readonlyAccountMeta(arciumAccounts.clockAccount),
		readonlyAccountMeta(SYSTEM_PROGRAM),
		readonlyAccountMeta(arciumAccounts.arciumProgram),
	];

	const planParams: CreateMarketPlanParams = {
		initializeMarket: {
			args: {
				question: params.question,
				resolutionDate: params.resolutionDate,
				liquidityCap: params.liquidityCap,
				initialLiquidityUsdc: initialLiquidity,
				oppWindowDuration: params.oppWindowDuration,
				pubWindowDuration: params.pubWindowDuration,
			},
			accounts: initializeMarketAccounts,
		},
		initializeMarketEncrypted: {
			args: {
				computationOffset,
				initialLiquidityUsdc: initialLiquidity,
				mxeNonce,
			},
			accounts: initializeMarketEncryptedAccounts,
		},
	};

	return makeCreateMarketTransactionPlan(params.planner, planParams);
};

export type PrivateTradeWithArciumParams = Readonly<{
	planner: TransactionPlanner;
	rpc: Rpc<SolanaRpcApi>;
	trader: Address | string;
	market: Address | string;
	tradeAmount: bigint;
	isBuyYes: boolean;
	userPositionAddress?: Address | string;
	programId?: string;
	plaintextOverride?: readonly bigint[];
}>;

export const planPrivateTradeWithArcium = async (
	params: PrivateTradeWithArciumParams,
): Promise<TransactionPlan> => {
	const programId = params.programId ?? PYTHIA_PROGRAM_ID;
	const traderAddress = asAddress(params.trader);
	const marketAddress = asAddress(params.market);
	const userPositionAddress =
		params.userPositionAddress !== undefined
			? asAddress(params.userPositionAddress)
			: await deriveUserPositionPda(marketAddress, traderAddress, programId);

	const snapshot = await fetchMxeSnapshot(params.rpc, programId);
	const tradeComputationOffset = generateComputationOffset();
	const updateComputationOffset = generateComputationOffset();

	const [tradeArciumAccounts, updateArciumAccounts] = await Promise.all([
		deriveArciumAccounts({
			computationOffset: tradeComputationOffset,
			circuit: 'process_private_trade',
			snapshot,
			programId,
		}),
		deriveArciumAccounts({
			computationOffset: updateComputationOffset,
			circuit: 'update_user_position',
			snapshot,
			programId,
		}),
	]);

	const plaintext: readonly bigint[] = params.plaintextOverride ?? [
		params.tradeAmount,
		params.isBuyYes ? 1n : 0n,
	];
	const encryptedPayload = encryptArciumPayload({
		plaintext,
		mxePublicKey: snapshot.x25519PublicKey,
	});

	const tradeAccounts: MakePrivateTradeIxAccounts = [
		writableSignerAccountMeta(traderAddress),
		writableAccountMeta(marketAddress),
		writableAccountMeta(tradeArciumAccounts.signPdaAccount),
		readonlyAccountMeta(tradeArciumAccounts.mxeAccount),
		writableAccountMeta(tradeArciumAccounts.mempoolAccount),
		writableAccountMeta(tradeArciumAccounts.executingPoolAccount),
		writableAccountMeta(tradeArciumAccounts.computationAccount),
		readonlyAccountMeta(tradeArciumAccounts.compDefAccount),
		writableAccountMeta(tradeArciumAccounts.clusterAccount),
		writableAccountMeta(tradeArciumAccounts.feePoolAccount),
		readonlyAccountMeta(tradeArciumAccounts.clockAccount),
		readonlyAccountMeta(SYSTEM_PROGRAM),
		readonlyAccountMeta(tradeArciumAccounts.arciumProgram),
	];

	const updateAccounts: MakeUpdateUserPositionPrivateIxAccounts = [
		writableSignerAccountMeta(traderAddress),
		readonlyAccountMeta(marketAddress),
		writableAccountMeta(userPositionAddress),
		writableAccountMeta(updateArciumAccounts.signPdaAccount),
		readonlyAccountMeta(updateArciumAccounts.mxeAccount),
		writableAccountMeta(updateArciumAccounts.mempoolAccount),
		writableAccountMeta(updateArciumAccounts.executingPoolAccount),
		writableAccountMeta(updateArciumAccounts.computationAccount),
		readonlyAccountMeta(updateArciumAccounts.compDefAccount),
		writableAccountMeta(updateArciumAccounts.clusterAccount),
		writableAccountMeta(updateArciumAccounts.feePoolAccount),
		readonlyAccountMeta(updateArciumAccounts.clockAccount),
		readonlyAccountMeta(SYSTEM_PROGRAM),
		readonlyAccountMeta(updateArciumAccounts.arciumProgram),
	];

	const planParams: PrivateTradePlanParams = {
		tradePrivate: {
			args: {
				computationOffset: tradeComputationOffset,
				tradeCiphertext: encryptedPayload.ciphertext,
				tradePubKey: encryptedPayload.traderPublicKey,
				tradeNonce: encryptedPayload.nonceValue,
			},
			accounts: tradeAccounts,
		},
		updateUserPositionPrivate: {
			args: {
				computationOffset: updateComputationOffset,
				tradeCiphertext: encryptedPayload.ciphertext,
				tradePubKey: encryptedPayload.traderPublicKey,
				tradeNonce: encryptedPayload.nonceValue,
			},
			accounts: updateAccounts,
		},
	};

	return makePrivateTradeTransactionPlan(params.planner, planParams);
};

const writableSignerAccountMeta = (address: Address | string): WritableSignerAccount => {
	return {
		address: asAddress(address),
		role: AccountRole.WRITABLE_SIGNER,
	};
};

const writableAccountMeta = (address: Address | string): WritableAccount => {
	return {
		address: asAddress(address),
		role: AccountRole.WRITABLE,
	};
};

const readonlyAccountMeta = (address: Address | string): ReadonlyAccount => {
	return {
		address: asAddress(address),
		role: AccountRole.READONLY,
	};
};

const asAddress = (value: Address | string): Address<string> => {
	return typeof value === 'string' ? toAddress(value) : value;
};
```
