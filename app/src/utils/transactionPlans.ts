import { type TransactionPlan, type TransactionPlanner } from '@solana/instruction-plans';
import type {
	MakeClosePositionPrivateIxAccounts,
	MakeClosePositionPrivateIxArguments,
	MakeGetSponsorViewIxAccounts,
	MakeGetSponsorViewIxArguments,
	MakeGetUserPositionViewIxAccounts,
	MakeGetUserPositionViewIxArguments,
	MakeInitSponsorIxArguments,
	MakeInitSponsorIxAccounts,
	MakeInitUserPositionIxAccounts,
	MakeInitUserPositionIxArguments,
	MakeInitializeMarketEncryptedIxAccounts,
	MakeInitializeMarketEncryptedIxArguments,
	MakeInitializeMarketIxAccounts,
	MakeInitializeMarketIxArguments,
	MakePublicTradeIxAccounts,
	MakePublicTradeIxArguments,
	MakeResolveMarketIxAccounts,
	MakeResolveMarketIxArguments,
	MakeSwitchToPrivateIxAccounts,
	MakeSwitchToPrivateIxArguments,
	MakeSwitchToPublicIxAccounts,
	MakeSwitchToPublicIxArguments,
	MakeUpdateUserPositionPrivateIxAccounts,
	MakeUpdateUserPositionPrivateIxArguments,
	MakePrivateTradeIxAccounts,
	MakePrivateTradeIxArguments,
} from './pythiaInstructions';
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

// =========================
// Sponsor-facing plan params
// =========================

export type CreateMarketPlanParams = Readonly<{
	initializeMarket: {
		args: MakeInitializeMarketIxArguments;
		accounts: MakeInitializeMarketIxAccounts;
	};
	initializeMarketEncrypted: {
		args: MakeInitializeMarketEncryptedIxArguments;
		accounts: MakeInitializeMarketEncryptedIxAccounts;
	};
}>;

export type SwitchToPublicPlanParams = Readonly<{
	args: MakeSwitchToPublicIxArguments;
	accounts: MakeSwitchToPublicIxAccounts;
}>;

export type SwitchToPrivatePlanParams = Readonly<{
	args: MakeSwitchToPrivateIxArguments;
	accounts: MakeSwitchToPrivateIxAccounts;
}>;

export type ResolveMarketPlanParams = Readonly<{
	args: MakeResolveMarketIxArguments;
	accounts: MakeResolveMarketIxAccounts;
}>;

export type SponsorViewMarketPlanParams = Readonly<{
	args: MakeGetSponsorViewIxArguments;
	accounts: MakeGetSponsorViewIxAccounts;
}>;

export type SponsorViewUserPositionPlanParams = Readonly<{
	args: MakeGetUserPositionViewIxArguments;
	accounts: MakeGetUserPositionViewIxAccounts;
}>;

export type InitSponsorPlanParams = Readonly<{
	args: MakeInitSponsorIxArguments;
	accounts: MakeInitSponsorIxAccounts;
}>;

// =======================
// Trader-facing plan params
// =======================

export type InitUserPositionPlanParams = Readonly<{
	args: MakeInitUserPositionIxArguments;
	accounts: MakeInitUserPositionIxAccounts;
}>;

export type PrivateTradePlanParams = Readonly<{
	// Private market trade that updates the encrypted market state.
	tradePrivate: {
		args: MakePrivateTradeIxArguments;
		accounts: MakePrivateTradeIxAccounts;
	};
	// Update the trader's encrypted position after the private trade.
	updateUserPositionPrivate: {
		args: MakeUpdateUserPositionPrivateIxArguments;
		accounts: MakeUpdateUserPositionPrivateIxAccounts;
	};
}>;

export type ClosePositionPrivatePlanParams = Readonly<{
	args: MakeClosePositionPrivateIxArguments;
	accounts: MakeClosePositionPrivateIxAccounts;
}>;

export type PublicTradePlanParams = Readonly<{
	args: MakePublicTradeIxArguments;
	accounts: MakePublicTradeIxAccounts;
}>;

// =========================
// Sponsor-facing plan stubs
// =========================

export async function makeCreateMarketTransactionPlan(
	planner: TransactionPlanner,
	params: CreateMarketPlanParams,
): Promise<TransactionPlan> {
	const plan = makeCreateMarketInstructionPlan(params);
	return planner(plan);
}

export async function makeSwitchToPublicTransactionPlan(
	planner: TransactionPlanner,
	params: SwitchToPublicPlanParams,
): Promise<TransactionPlan> {
	const plan = makeSwitchToPublicInstructionPlan(params);
	return planner(plan);
}

export async function makeSwitchToPrivateTransactionPlan(
	planner: TransactionPlanner,
	params: SwitchToPrivatePlanParams,
): Promise<TransactionPlan> {
	const plan = makeSwitchToPrivateInstructionPlan(params);
	return planner(plan);
}

export async function makeResolveMarketTransactionPlan(
	planner: TransactionPlanner,
	params: ResolveMarketPlanParams,
): Promise<TransactionPlan> {
	const plan = makeResolveMarketInstructionPlan(params);
	return planner(plan);
}

export async function makeGetSponsorViewTransactionPlan(
	planner: TransactionPlanner,
	params: SponsorViewMarketPlanParams,
): Promise<TransactionPlan> {
	const plan = makeGetSponsorViewInstructionPlan(params);
	return planner(plan);
}

export async function makeGetUserPositionViewTransactionPlan(
	planner: TransactionPlanner,
	params: SponsorViewUserPositionPlanParams,
): Promise<TransactionPlan> {
	const plan = makeGetUserPositionViewInstructionPlan(params);
	return planner(plan);
}

export async function makeInitSponsorTransactionPlan(
	planner: TransactionPlanner,
	params: InitSponsorPlanParams,
): Promise<TransactionPlan> {
	const plan = makeInitSponsorInstructionPlan(params);
	return planner(plan);
}

// =======================
// Trader-facing plan stubs
// =======================

export async function makeInitUserPositionTransactionPlan(
	planner: TransactionPlanner,
	params: InitUserPositionPlanParams,
): Promise<TransactionPlan> {
	const plan = makeInitUserPositionInstructionPlan(params);
	return planner(plan);
}

export async function makePrivateTradeTransactionPlan(
	planner: TransactionPlanner,
	params: PrivateTradePlanParams,
): Promise<TransactionPlan> {
	const plan = makePrivateTradeInstructionPlan(params);
	return planner(plan);
}

export async function makeClosePositionPrivateTransactionPlan(
	planner: TransactionPlanner,
	params: ClosePositionPrivatePlanParams,
): Promise<TransactionPlan> {
	const plan = makeClosePositionPrivateInstructionPlan(params);
	return planner(plan);
}

export async function makePublicTradeTransactionPlan(
	planner: TransactionPlanner,
	params: PublicTradePlanParams,
): Promise<TransactionPlan> {
	const plan = makePublicTradeInstructionPlan(params);
	return planner(plan);
}
