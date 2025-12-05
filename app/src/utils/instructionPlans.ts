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
} from './pythiaInstructionsSync';
import {
	makeClosePositionPrivateIxSync,
	makeGetSponsorViewIxSync,
	makeGetUserPositionViewIxSync,
	makeInitSponsorIxSync,
	makeInitUserPositionIxSync,
	makeInitializeMarketEncryptedIxSync,
	makeInitializeMarketIxSync,
	makePrivateTradeIxSync,
	makeUpdateUserPositionPrivateIxSync,
	makePublicTradeIxSync,
	makeResolveMarketIxSync,
	makeSwitchToPrivateIxSync,
	makeSwitchToPublicIxSync,
} from './pythiaInstructionsSync';

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
	const initMarketIx = makeInitializeMarketIxSync(
		params.initializeMarket.args,
		params.initializeMarket.accounts,
	);
	const initMarketEncryptedIx = makeInitializeMarketEncryptedIxSync(
		params.initializeMarketEncrypted.args,
		params.initializeMarketEncrypted.accounts,
	);
	// @todo: NEED TO CHECK IF IXs can be sent sequentially.
	return sequentialInstructionPlan([initMarketIx, initMarketEncryptedIx]);
}

export function makeSwitchToPublicInstructionPlan(
	params: SwitchToPublicPlanParams,
): InstructionPlan {
	const ix = makeSwitchToPublicIxSync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeSwitchToPrivateInstructionPlan(
	params: SwitchToPrivatePlanParams,
): InstructionPlan {
	const ix = makeSwitchToPrivateIxSync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeResolveMarketInstructionPlan(params: ResolveMarketPlanParams): InstructionPlan {
	const ix = makeResolveMarketIxSync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeGetSponsorViewInstructionPlan(
	params: SponsorViewMarketPlanParams,
): InstructionPlan {
	const ix = makeGetSponsorViewIxSync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeGetUserPositionViewInstructionPlan(
	params: SponsorViewUserPositionPlanParams,
): InstructionPlan {
	const ix = makeGetUserPositionViewIxSync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makeInitSponsorInstructionPlan(params: InitSponsorPlanParams): InstructionPlan {
	const ix = makeInitSponsorIxSync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

// Trader-facing InstructionPlan helpers
export function makeInitUserPositionInstructionPlan(
	params: InitUserPositionPlanParams,
): InstructionPlan {
	const ix = makeInitUserPositionIxSync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makePrivateTradeInstructionPlan(params: PrivateTradePlanParams): InstructionPlan {
	const tradeIx = makePrivateTradeIxSync(params.tradePrivate.args, params.tradePrivate.accounts);
	const updateIx = makeUpdateUserPositionPrivateIxSync(
		params.updateUserPositionPrivate.args,
		params.updateUserPositionPrivate.accounts,
	);
	// @todo: NEED TO CHECK IF IXs can be sent sequentially.
	return sequentialInstructionPlan([tradeIx, updateIx]);
}

export function makeClosePositionPrivateInstructionPlan(
	params: ClosePositionPrivatePlanParams,
): InstructionPlan {
	const ix = makeClosePositionPrivateIxSync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}

export function makePublicTradeInstructionPlan(params: PublicTradePlanParams): InstructionPlan {
	const ix = makePublicTradeIxSync(params.args, params.accounts);
	return singleInstructionPlan(ix);
}
