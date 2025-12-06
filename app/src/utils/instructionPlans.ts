import {
	sequentialInstructionPlan,
	singleInstructionPlan,
	type InstructionPlan,
} from '@solana/instruction-plans';
import type {
	MakeClosePositionPrivateIxAsyncInput,
	MakeGetSponsorViewIxAsyncInput,
	MakeGetUserPositionViewIxAsyncInput,
	MakeInitSponsorIxAsyncInput,
	MakeInitUserPositionIxAsyncInput,
	MakeInitializeMarketEncryptedIxAsyncInput,
	MakeInitializeMarketIxAsyncInput,
	MakePublicTradeIxAsyncInput,
	MakeResolveMarketIxAsyncInput,
	MakeSwitchToPrivateIxAsyncInput,
	MakeSwitchToPublicIxAsyncInput,
	MakeUpdateUserPositionPrivateIxAsyncInput,
	MakePrivateTradeIxAsyncInput,
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
	initializeMarket: MakeInitializeMarketIxAsyncInput;
	initializeMarketEncrypted: MakeInitializeMarketEncryptedIxAsyncInput;
}>;

export type SwitchToPublicPlanParams = MakeSwitchToPublicIxAsyncInput;

export type SwitchToPrivatePlanParams = MakeSwitchToPrivateIxAsyncInput;

export type ResolveMarketPlanParams = MakeResolveMarketIxAsyncInput;

export type SponsorViewMarketPlanParams = MakeGetSponsorViewIxAsyncInput;

export type SponsorViewUserPositionPlanParams = MakeGetUserPositionViewIxAsyncInput;

export type InitSponsorPlanParams = MakeInitSponsorIxAsyncInput;

export type InitUserPositionPlanParams = MakeInitUserPositionIxAsyncInput;

export type PrivateTradePlanParams = Readonly<{
	tradePrivate: MakePrivateTradeIxAsyncInput;
	updateUserPositionPrivate: MakeUpdateUserPositionPrivateIxAsyncInput;
}>;

export type ClosePositionPrivatePlanParams = MakeClosePositionPrivateIxAsyncInput;

export type PublicTradePlanParams = MakePublicTradeIxAsyncInput;

// Sponsor-facing InstructionPlan helpers
export async function makeCreateMarketInstructionPlan(
	params: CreateMarketPlanParams,
): Promise<InstructionPlan> {
	const initMarketIx = await makeInitializeMarketIxAsync(params.initializeMarket);
	const initMarketEncryptedIx = await makeInitializeMarketEncryptedIxAsync(
		params.initializeMarketEncrypted,
	);
	// @todo: NEED TO CHECK IF IXs can be sent sequentially.
	return sequentialInstructionPlan([initMarketIx, initMarketEncryptedIx]);
}

export async function makeSwitchToPublicInstructionPlan(
	params: SwitchToPublicPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeSwitchToPublicIxAsync(params);
	return singleInstructionPlan(ix);
}

export async function makeSwitchToPrivateInstructionPlan(
	params: SwitchToPrivatePlanParams,
): Promise<InstructionPlan> {
	const ix = await makeSwitchToPrivateIxAsync(params);
	return singleInstructionPlan(ix);
}

export async function makeResolveMarketInstructionPlan(
	params: ResolveMarketPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeResolveMarketIxAsync(params);
	return singleInstructionPlan(ix);
}

export async function makeGetSponsorViewInstructionPlan(
	params: SponsorViewMarketPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeGetSponsorViewIxAsync(params);
	return singleInstructionPlan(ix);
}

export async function makeGetUserPositionViewInstructionPlan(
	params: SponsorViewUserPositionPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeGetUserPositionViewIxAsync(params);
	return singleInstructionPlan(ix);
}

export async function makeInitSponsorInstructionPlan(
	params: InitSponsorPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeInitSponsorIxAsync(params);
	return singleInstructionPlan(ix);
}

// Trader-facing InstructionPlan helpers
export async function makeInitUserPositionInstructionPlan(
	params: InitUserPositionPlanParams,
): Promise<InstructionPlan> {
	const ix = await makeInitUserPositionIxAsync(params);
	return singleInstructionPlan(ix);
}

export async function makePrivateTradeInstructionPlan(
	params: PrivateTradePlanParams,
): Promise<InstructionPlan> {
	const tradeIx = await makePrivateTradeIxAsync(params.tradePrivate);
	const updateIx = await makeUpdateUserPositionPrivateIxAsync(
		params.updateUserPositionPrivate,
	);
	// @todo: NEED TO CHECK IF IXs can be sent sequentially.
	return sequentialInstructionPlan([tradeIx, updateIx]);
}

export async function makeClosePositionPrivateInstructionPlan(
	params: ClosePositionPrivatePlanParams,
): Promise<InstructionPlan> {
	const ix = await makeClosePositionPrivateIxAsync(params);
	return singleInstructionPlan(ix);
}

export async function makePublicTradeInstructionPlan(
	params: PublicTradePlanParams,
): Promise<InstructionPlan> {
	const ix = await makePublicTradeIxAsync(params);
	return singleInstructionPlan(ix);
}
