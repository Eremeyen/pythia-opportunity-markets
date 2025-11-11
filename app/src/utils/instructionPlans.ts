import {
	sequentialInstructionPlan,
	singleInstructionPlan,
	type InstructionPlan,
} from '@solana/instruction-plans';
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
	makeClosePositionPrivateIx,
	makeGetSponsorViewIx,
	makeGetUserPositionViewIx,
	makeInitSponsorIx,
	makeInitUserPositionIx,
	makeInitializeMarketEncryptedIx,
	makeInitializeMarketIx,
	makePrivateTradeIx,
	makeUpdateUserPositionPrivateIx,
	makePublicTradeIx,
	makeResolveMarketIx,
	makeSwitchToPrivateIx,
	makeSwitchToPublicIx,
} from './pythiaInstructions';

// Parameter types (duplicated here to avoid circular imports with transactionPlans.ts)
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

export type InitUserPositionPlanParams = Readonly<{
	args: MakeInitUserPositionIxArguments;
	accounts: MakeInitUserPositionIxAccounts;
}>;

export type PrivateTradePlanParams = Readonly<{
	tradePrivate: {
		args: MakePrivateTradeIxArguments;
		accounts: MakePrivateTradeIxAccounts;
	};
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

// Sponsor-facing InstructionPlan helpers
export function makeCreateMarketInstructionPlan(params: CreateMarketPlanParams): InstructionPlan {
	const initMarketIx = makeInitializeMarketIx(
		params.initializeMarket.args,
		params.initializeMarket.accounts,
	);
	const initMarketEncryptedIx = makeInitializeMarketEncryptedIx(
		params.initializeMarketEncrypted.args,
		params.initializeMarketEncrypted.accounts,
	);
	return sequentialInstructionPlan([initMarketIx, initMarketEncryptedIx]);
}

export function makeSwitchToPublicInstructionPlan(
	params: SwitchToPublicPlanParams,
): InstructionPlan {
	const ix = makeSwitchToPublicIx(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeSwitchToPrivateInstructionPlan(
	params: SwitchToPrivatePlanParams,
): InstructionPlan {
	const ix = makeSwitchToPrivateIx(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeResolveMarketInstructionPlan(params: ResolveMarketPlanParams): InstructionPlan {
	const ix = makeResolveMarketIx(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeGetSponsorViewInstructionPlan(
	params: SponsorViewMarketPlanParams,
): InstructionPlan {
	const ix = makeGetSponsorViewIx(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeGetUserPositionViewInstructionPlan(
	params: SponsorViewUserPositionPlanParams,
): InstructionPlan {
	const ix = makeGetUserPositionViewIx(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeInitSponsorInstructionPlan(params: InitSponsorPlanParams): InstructionPlan {
	const ix = makeInitSponsorIx(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

// Trader-facing InstructionPlan helpers
export function makeInitUserPositionInstructionPlan(
	params: InitUserPositionPlanParams,
): InstructionPlan {
	const ix = makeInitUserPositionIx(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makePrivateTradeInstructionPlan(params: PrivateTradePlanParams): InstructionPlan {
	const tradeIx = makePrivateTradeIx(params.tradePrivate.args, params.tradePrivate.accounts);
	const updateIx = makeUpdateUserPositionPrivateIx(
		params.updateUserPositionPrivate.args,
		params.updateUserPositionPrivate.accounts,
	);
	return sequentialInstructionPlan([tradeIx, updateIx]);
}

export function makeClosePositionPrivateInstructionPlan(
	params: ClosePositionPrivatePlanParams,
): InstructionPlan {
	const ix = makeClosePositionPrivateIx(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makePublicTradeInstructionPlan(params: PublicTradePlanParams): InstructionPlan {
	const ix = makePublicTradeIx(params.args, params.accounts);
	return singleInstructionPlan(ix);
}
