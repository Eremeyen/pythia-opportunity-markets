import { type TransactionPlan, type TransactionPlanner } from '@solana/instruction-plans';
import type {
	MakeClosePositionPrivateIxAsyncAccounts,
	MakeClosePositionPrivateIxAsyncArguments,
	MakeGetSponsorViewIxAsyncAccounts,
	MakeGetSponsorViewIxAsyncArguments,
	MakeGetUserPositionViewIxAsyncAccounts,
	MakeGetUserPositionViewIxAsyncArguments,
	MakeInitSponsorIxAsyncArguments,
	MakeInitSponsorIxAsyncAccounts,
	MakeInitUserPositionIxAsyncAccounts,
	MakeInitUserPositionIxAsyncArguments,
	MakeInitializeMarketEncryptedIxAsyncAccounts,
	MakeInitializeMarketEncryptedIxAsyncArguments,
	MakeInitializeMarketIxAsyncAccounts,
	MakeInitializeMarketIxAsyncArguments,
	MakePublicTradeIxAsyncAccounts,
	MakePublicTradeIxAsyncArguments,
	MakeResolveMarketIxAsyncAccounts,
	MakeResolveMarketIxAsyncArguments,
	MakeSwitchToPrivateIxAsyncAccounts,
	MakeSwitchToPrivateIxAsyncArguments,
	MakeSwitchToPublicIxAsyncAccounts,
	MakeSwitchToPublicIxAsyncArguments,
	MakeUpdateUserPositionPrivateIxAsyncAccounts,
	MakeUpdateUserPositionPrivateIxAsyncArguments,
	MakePrivateTradeIxAsyncAccounts,
	MakePrivateTradeIxAsyncArguments,
} from './pythiaInstructionsAsync';
import {
	makeClosePositionPrivateInstructionPlan,
	makeCreateMarketInstructionPlan,
	makeGetSponsorViewInstructionPlan,
	makeGetUserPositionViewInstructionPlan,
	makeInitSponsorInstructionPlan,
	makeInitUserPositionInstructionPlan,
	makePrivateTradeInstructionPlan,
	makePublicTradeInstructionPlan,
	makeResolveMarketInstructionPlan,
	makeSwitchToPrivateInstructionPlan,
	makeSwitchToPublicInstructionPlan,
} from './instructionPlans';

/**
 * Note: This module uses async instruction builders (pythiaInstructionsAsync) that
 * auto-derive PDAs and fill default programs. See INTEGRATION.md for details.
 */

// =========================
// Sponsor-facing plan params
// =========================

export type CreateMarketPlanParams = Readonly<{
	initializeMarket: {
		args: MakeInitializeMarketIxAsyncArguments;
		accounts: MakeInitializeMarketIxAsyncAccounts;
	};
	initializeMarketEncrypted: {
		args: MakeInitializeMarketEncryptedIxAsyncArguments;
		accounts: MakeInitializeMarketEncryptedIxAsyncAccounts;
	};
}>;

export type SwitchToPublicPlanParams = Readonly<{
	args: MakeSwitchToPublicIxAsyncArguments;
	accounts: MakeSwitchToPublicIxAsyncAccounts;
}>;

export type SwitchToPrivatePlanParams = Readonly<{
	args: MakeSwitchToPrivateIxAsyncArguments;
	accounts: MakeSwitchToPrivateIxAsyncAccounts;
}>;

export type ResolveMarketPlanParams = Readonly<{
	args: MakeResolveMarketIxAsyncArguments;
	accounts: MakeResolveMarketIxAsyncAccounts;
}>;

export type SponsorViewMarketPlanParams = Readonly<{
	args: MakeGetSponsorViewIxAsyncArguments;
	accounts: MakeGetSponsorViewIxAsyncAccounts;
}>;

export type SponsorViewUserPositionPlanParams = Readonly<{
	args: MakeGetUserPositionViewIxAsyncArguments;
	accounts: MakeGetUserPositionViewIxAsyncAccounts;
}>;

export type InitSponsorPlanParams = Readonly<{
	args: MakeInitSponsorIxAsyncArguments;
	accounts: MakeInitSponsorIxAsyncAccounts;
}>;

// =======================
// Trader-facing plan params
// =======================

export type InitUserPositionPlanParams = Readonly<{
	args: MakeInitUserPositionIxAsyncArguments;
	accounts: MakeInitUserPositionIxAsyncAccounts;
}>;

export type PrivateTradePlanParams = Readonly<{
	// Private market trade that updates the encrypted market state.
	tradePrivate: {
		args: MakePrivateTradeIxAsyncArguments;
		accounts: MakePrivateTradeIxAsyncAccounts;
	};
	// Update the trader's encrypted position after the private trade.
	updateUserPositionPrivate: {
		args: MakeUpdateUserPositionPrivateIxAsyncArguments;
		accounts: MakeUpdateUserPositionPrivateIxAsyncAccounts;
	};
}>;

export type ClosePositionPrivatePlanParams = Readonly<{
	args: MakeClosePositionPrivateIxAsyncArguments;
	accounts: MakeClosePositionPrivateIxAsyncAccounts;
}>;

export type PublicTradePlanParams = Readonly<{
	args: MakePublicTradeIxAsyncArguments;
	accounts: MakePublicTradeIxAsyncAccounts;
}>;

// =========================
// Sponsor-facing plan stubs
// =========================

export const makeCreateMarketTransactionPlan = async (
	planner: TransactionPlanner,
	params: CreateMarketPlanParams,
): Promise<TransactionPlan> => {
	const plan = await makeCreateMarketInstructionPlan(params);
	return planner(plan);
};

export const makeSwitchToPublicTransactionPlan = async (
	planner: TransactionPlanner,
	params: SwitchToPublicPlanParams,
): Promise<TransactionPlan> => {
	const plan = await makeSwitchToPublicInstructionPlan(params);
	return planner(plan);
};

export const makeSwitchToPrivateTransactionPlan = async (
	planner: TransactionPlanner,
	params: SwitchToPrivatePlanParams,
): Promise<TransactionPlan> => {
	const plan = await makeSwitchToPrivateInstructionPlan(params);
	return planner(plan);
};

export const makeResolveMarketTransactionPlan = async (
	planner: TransactionPlanner,
	params: ResolveMarketPlanParams,
): Promise<TransactionPlan> => {
	const plan = await makeResolveMarketInstructionPlan(params);
	return planner(plan);
};

export const makeGetSponsorViewTransactionPlan = async (
	planner: TransactionPlanner,
	params: SponsorViewMarketPlanParams,
): Promise<TransactionPlan> => {
	const plan = await makeGetSponsorViewInstructionPlan(params);
	return planner(plan);
};

export const makeGetUserPositionViewTransactionPlan = async (
	planner: TransactionPlanner,
	params: SponsorViewUserPositionPlanParams,
): Promise<TransactionPlan> => {
	const plan = await makeGetUserPositionViewInstructionPlan(params);
	return planner(plan);
};

export const makeInitSponsorTransactionPlan = async (
	planner: TransactionPlanner,
	params: InitSponsorPlanParams,
): Promise<TransactionPlan> => {
	const plan = await makeInitSponsorInstructionPlan(params);
	return planner(plan);
};

// =======================
// Trader-facing plan stubs
// =======================

export const makeInitUserPositionTransactionPlan = async (
	planner: TransactionPlanner,
	params: InitUserPositionPlanParams,
): Promise<TransactionPlan> => {
	const plan = await makeInitUserPositionInstructionPlan(params);
	return planner(plan);
};

export const makePrivateTradeTransactionPlan = async (
	planner: TransactionPlanner,
	params: PrivateTradePlanParams,
): Promise<TransactionPlan> => {
	const plan = await makePrivateTradeInstructionPlan(params);
	return planner(plan);
};

export const makeClosePositionPrivateTransactionPlan = async (
	planner: TransactionPlanner,
	params: ClosePositionPrivatePlanParams,
): Promise<TransactionPlan> => {
	const plan = await makeClosePositionPrivateInstructionPlan(params);
	return planner(plan);
};

export const makePublicTradeTransactionPlan = async (
	planner: TransactionPlanner,
	params: PublicTradePlanParams,
): Promise<TransactionPlan> => {
	const plan = await makePublicTradeInstructionPlan(params);
	return planner(plan);
};

// =========================
// High-level builders (NEW AND NEEDS TO BE CHECKED)
// =========================

// TODO: Reintroduce high-level Arcium builders.
// Implementation notes:
// - Derive PDAs for sponsor/market/user position via deriveSponsorPda/deriveMarketPda/deriveUserPositionPda.
// - Fetch MXE snapshot, generate computation offsets and MXE nonce, and derive Arcium accounts per circuit.
// - Encrypt payloads (e.g., trade amount + side) with the MXE public key.
// - Build account metas (signer/writable/readonly) including System Program and Arcium PDAs.
// - Delegate to lower-level planners (makeCreateMarketTransactionPlan, makePrivateTradeTransactionPlan).
