import {
	sequentialInstructionPlan,
	singleInstructionPlan,
	type InstructionPlan,
} from '@solana/instruction-plans';
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
	makeClosePositionPrivateIxAsync,
	makeGetSponsorViewIxAsync,
	makeGetUserPositionViewIxAsync,
	makeInitSponsorIxAsync,
	makeInitUserPositionIxAsync,
	makeInitializeMarketEncryptedIxAsync,
	makeInitializeMarketIxAsync,
	makePrivateTradeIxAsync,
	makeUpdateUserPositionPrivateIxAsync,
	makePublicTradeIxAsync,
	makeResolveMarketIxAsync,
	makeSwitchToPrivateIxAsync,
	makeSwitchToPublicIxAsync,
} from './pythiaInstructionsAsync';

// Parameter types (duplicated here to avoid circular imports with transactionPlans.ts)
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

export type InitUserPositionPlanParams = Readonly<{
	args: MakeInitUserPositionIxAsyncArguments;
	accounts: MakeInitUserPositionIxAsyncAccounts;
}>;

export type PrivateTradePlanParams = Readonly<{
	tradePrivate: {
		args: MakePrivateTradeIxAsyncArguments;
		accounts: MakePrivateTradeIxAsyncAccounts;
	};
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

// Sponsor-facing InstructionPlan helpers
export async function makeCreateMarketInstructionPlan(
	params: CreateMarketPlanParams,
): Promise<InstructionPlan> {
	const initMarketIx = await makeInitializeMarketIxAsync(
		params.initializeMarket.args,
		params.initializeMarket.accounts,
	);
	const initMarketEncryptedIx = await makeInitializeMarketEncryptedIxAsync(
		params.initializeMarketEncrypted.args,
		params.initializeMarketEncrypted.accounts,
	);
	// @todo: NEED TO CHECK IF IXs can be sent sequentially.
	return sequentialInstructionPlan([initMarketIx, initMarketEncryptedIx]);
}

export async function makeSwitchToPublicInstructionPlan(
	params: SwitchToPublicPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeSwitchToPublicIxAsync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export async function makeSwitchToPrivateInstructionPlan(
	params: SwitchToPrivatePlanParams,
): Promise<InstructionPlan> {
	const ix = await makeSwitchToPrivateIxAsync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export async function makeResolveMarketInstructionPlan(
	params: ResolveMarketPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeResolveMarketIxAsync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export async function makeGetSponsorViewInstructionPlan(
	params: SponsorViewMarketPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeGetSponsorViewIxAsync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export async function makeGetUserPositionViewInstructionPlan(
	params: SponsorViewUserPositionPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeGetUserPositionViewIxAsync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export async function makeInitSponsorInstructionPlan(
	params: InitSponsorPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeInitSponsorIxAsync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

// Trader-facing InstructionPlan helpers
export async function makeInitUserPositionInstructionPlan(
	params: InitUserPositionPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeInitUserPositionIxAsync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export async function makePrivateTradeInstructionPlan(
	params: PrivateTradePlanParams,
): Promise<InstructionPlan> {
	const tradeIx = await makePrivateTradeIxAsync(
		params.tradePrivate.args,
		params.tradePrivate.accounts,
	);
	const updateIx = await makeUpdateUserPositionPrivateIxAsync(
		params.updateUserPositionPrivate.args,
		params.updateUserPositionPrivate.accounts,
	);
	// @todo: NEED TO CHECK IF IXs can be sent sequentially.
	return sequentialInstructionPlan([tradeIx, updateIx]);
}

export async function makeClosePositionPrivateInstructionPlan(
	params: ClosePositionPrivatePlanParams,
): Promise<InstructionPlan> {
	const ix = await makeClosePositionPrivateIxAsync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export async function makePublicTradeInstructionPlan(
	params: PublicTradePlanParams,
): Promise<InstructionPlan> {
	const ix = await makePublicTradeIxAsync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}
