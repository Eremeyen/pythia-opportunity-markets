import {
	type Instruction,
	type WritableSignerAccount,
	type WritableAccount,
	type ReadonlyAccount,
	address,
	getBooleanEncoder,
	getHiddenPrefixEncoder,
	getConstantEncoder,
	getStructEncoder,
	getU64Encoder,
	fixEncoderSize,
	getBytesEncoder,
	getU128Encoder,
	addEncoderSizePrefix,
	getUtf8Encoder,
	getU32Encoder,
} from '@solana/kit';
import { PYTHIA_PROGRAM_ID, type PythiaProgramAddressType } from '../config/config';
// import { getCreateAccountInstruction} from '@solana-program/system';

export type MakeInitSponsorIxArguments = {
	name: string;
};

type PythiaInstruction = Instruction<PythiaProgramAddressType>;

export type MakeInitSponsorIxAccounts = readonly [
	WritableSignerAccount,
	WritableAccount,
	ReadonlyAccount,
];

export type MakeWhitelistSponsorIxAccounts = readonly [WritableSignerAccount, WritableAccount];

type InitCompDefAccountsTuple = readonly [
	WritableSignerAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakeInitInitializeMarketCompDefIxAccounts = InitCompDefAccountsTuple;
export type MakeInitInitializeUserPositionCompDefIxAccounts = InitCompDefAccountsTuple;
export type MakeInitProcessPrivateTradeCompDefIxAccounts = InitCompDefAccountsTuple;
export type MakeInitUpdateUserPositionCompDefIxAccounts = InitCompDefAccountsTuple;
export type MakeInitClosePositionCompDefIxAccounts = InitCompDefAccountsTuple;
export type MakeInitRevealMarketStateCompDefIxAccounts = InitCompDefAccountsTuple;
export type MakeInitRevealUserPositionCompDefIxAccounts = InitCompDefAccountsTuple;
export type MakeInitHideMarketStateCompDefIxAccounts = InitCompDefAccountsTuple;
export type MakeInitViewMarketStateCompDefIxAccounts = InitCompDefAccountsTuple;
export type MakeInitViewUserPositionCompDefIxAccounts = InitCompDefAccountsTuple;

export type MakeInitializeMarketIxArguments = {
	question: string;
	resolutionDate: bigint;
	liquidityCap: bigint;
	initialLiquidityUsdc: bigint;
	oppWindowDuration: bigint;
	pubWindowDuration: bigint;
};

export type MakeInitializeMarketIxAccounts = readonly [
	WritableSignerAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
];

export type MakeInitializeMarketEncryptedIxArguments = {
	computationOffset: bigint;
	initialLiquidityUsdc: bigint;
	mxeNonce: bigint;
};

export type MakeInitializeMarketEncryptedIxAccounts = readonly [
	WritableSignerAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakeInitUserPositionIxArguments = {
	computationOffset: bigint;
	mxeNonce: bigint;
};

export type MakeInitUserPositionIxAccounts = readonly [
	WritableSignerAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakePrivateTradeIxArguments = {
	computationOffset: bigint;
	tradeCiphertext: Uint8Array;
	tradePubKey: Uint8Array;
	tradeNonce: bigint;
};

export type MakePrivateTradeIxAccounts = readonly [
	WritableSignerAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakeUpdateUserPositionPrivateIxArguments = {
	computationOffset: bigint;
	tradeCiphertext: Uint8Array;
	tradePubKey: Uint8Array;
	tradeNonce: bigint;
};

export type MakeUpdateUserPositionPrivateIxAccounts = readonly [
	WritableSignerAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakeClosePositionPrivateIxArguments = {
	computationOffset: bigint;
	closeCiphertext: Uint8Array;
	closePubKey: Uint8Array;
	closeNonce: bigint;
};

export type MakeClosePositionPrivateIxAccounts = readonly [
	WritableSignerAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakeSwitchToPublicIxArguments = {
	computationOffset: bigint;
};

export type MakeSwitchToPublicIxAccounts = readonly [
	WritableSignerAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakePublicTradeIxArguments = {
	usdcAmount: bigint;
	isBuyYes: boolean;
};

export type MakePublicTradeIxAccounts = readonly [WritableSignerAccount, WritableAccount];

export type MakeSwitchToPrivateIxArguments = {
	computationOffset: bigint;
	mxeNonce: bigint;
};

export type MakeSwitchToPrivateIxAccounts = readonly [
	WritableSignerAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakeGetSponsorViewIxArguments = {
	computationOffset: bigint;
	sponsorPubKey: Uint8Array;
};

export type MakeGetSponsorViewIxAccounts = readonly [
	WritableSignerAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakeGetUserPositionViewIxArguments = {
	computationOffset: bigint;
	sponsorPubKey: Uint8Array;
};

export type MakeGetUserPositionViewIxAccounts = readonly [
	WritableSignerAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	WritableAccount,
	WritableAccount,
	ReadonlyAccount,
	ReadonlyAccount,
	ReadonlyAccount,
];

export type MakeResolveMarketIxArguments = {
	outcome: boolean;
};

export type MakeResolveMarketIxAccounts = readonly [WritableSignerAccount, WritableAccount];

// TODO: tighten return types by modeling per-instruction account metas and data.

export const makeInitSponsorIx = (
	_args: MakeInitSponsorIxArguments,
	_accounts: MakeInitSponsorIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_SPONSOR_DISCRIMINATOR = new Uint8Array([171, 84, 165, 61, 98, 53, 242, 108]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([['name', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())]]),
		[getConstantEncoder(INIT_SPONSOR_DISCRIMINATOR)],
	).encode({ name: _args.name });
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeWhitelistSponsorIx = (
	_accounts: MakeWhitelistSponsorIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const WHITELIST_SPONSOR_DISCRIMINATOR = new Uint8Array([147, 216, 206, 186, 143, 127, 202, 82]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: WHITELIST_SPONSOR_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitInitializeMarketCompDefIx = (
	_accounts: MakeInitInitializeMarketCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_INITIALIZE_MARKET_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		24, 189, 120, 238, 233, 191, 218, 229,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_INITIALIZE_MARKET_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitInitializeUserPositionCompDefIx = (
	_accounts: MakeInitInitializeUserPositionCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_INITIALIZE_USER_POSITION_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		172, 177, 42, 178, 176, 219, 231, 85,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_INITIALIZE_USER_POSITION_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitProcessPrivateTradeCompDefIx = (
	_accounts: MakeInitProcessPrivateTradeCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_PROCESS_PRIVATE_TRADE_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		30, 9, 66, 130, 1, 172, 216, 118,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_PROCESS_PRIVATE_TRADE_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitUpdateUserPositionCompDefIx = (
	_accounts: MakeInitUpdateUserPositionCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_UPDATE_USER_POSITION_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		57, 215, 57, 207, 223, 60, 138, 92,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_UPDATE_USER_POSITION_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitClosePositionCompDefIx = (
	_accounts: MakeInitClosePositionCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_CLOSE_POSITION_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		104, 198, 244, 210, 166, 227, 160, 187,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_CLOSE_POSITION_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitRevealMarketStateCompDefIx = (
	_accounts: MakeInitRevealMarketStateCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_REVEAL_MARKET_STATE_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		3, 71, 205, 152, 244, 163, 234, 144,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_REVEAL_MARKET_STATE_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitRevealUserPositionCompDefIx = (
	_accounts: MakeInitRevealUserPositionCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_REVEAL_USER_POSITION_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		184, 228, 163, 182, 169, 253, 252, 147,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_REVEAL_USER_POSITION_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitHideMarketStateCompDefIx = (
	_accounts: MakeInitHideMarketStateCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_HIDE_MARKET_STATE_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		216, 176, 90, 160, 254, 218, 37, 130,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_HIDE_MARKET_STATE_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitViewMarketStateCompDefIx = (
	_accounts: MakeInitViewMarketStateCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_VIEW_MARKET_STATE_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		240, 157, 239, 254, 11, 172, 57, 131,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_VIEW_MARKET_STATE_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitViewUserPositionCompDefIx = (
	_accounts: MakeInitViewUserPositionCompDefIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_VIEW_USER_POSITION_COMP_DEF_DISCRIMINATOR = new Uint8Array([
		104, 194, 110, 7, 208, 177, 164, 146,
	]);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data: INIT_VIEW_USER_POSITION_COMP_DEF_DISCRIMINATOR,
	};
	return ix;
};

export const makeInitializeMarketIx = (
	_args: MakeInitializeMarketIxArguments,
	_accounts: MakeInitializeMarketIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_MARKET_DISCRIMINATOR = new Uint8Array([33, 253, 15, 116, 89, 25, 127, 236]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['question', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
			['resolutionDate', getU64Encoder()],
			['liquidityCap', getU64Encoder()],
			['initialLiquidityUsdc', getU64Encoder()],
			['oppWindowDuration', getU64Encoder()],
			['pubWindowDuration', getU64Encoder()],
		]),
		[getConstantEncoder(INIT_MARKET_DISCRIMINATOR)],
	).encode({
		question: _args.question,
		resolutionDate: _args.resolutionDate,
		liquidityCap: _args.liquidityCap,
		initialLiquidityUsdc: _args.initialLiquidityUsdc,
		oppWindowDuration: _args.oppWindowDuration,
		pubWindowDuration: _args.pubWindowDuration,
	});
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeInitializeMarketEncryptedIx = (
	_args: MakeInitializeMarketEncryptedIxArguments,
	_accounts: MakeInitializeMarketEncryptedIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_MARKET_ENCRYPTED_DISCRIMINATOR = new Uint8Array([
		37, 235, 227, 196, 198, 232, 201, 57,
	]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['computationOffset', getU64Encoder()],
			['initialLiquidityUsdc', getU64Encoder()],
			['mxeNonce', getU128Encoder()],
		]),
		[getConstantEncoder(INIT_MARKET_ENCRYPTED_DISCRIMINATOR)],
	).encode({
		computationOffset: _args.computationOffset,
		initialLiquidityUsdc: _args.initialLiquidityUsdc,
		mxeNonce: _args.mxeNonce,
	});
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeInitUserPositionIx = (
	_args: MakeInitUserPositionIxArguments,
	_accounts: MakeInitUserPositionIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const INIT_USER_POSITION_DISCRIMINATOR = new Uint8Array([131, 197, 183, 39, 12, 98, 108, 68]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['computationOffset', getU64Encoder()],
			['mxeNonce', getU128Encoder()],
		]),
		[getConstantEncoder(INIT_USER_POSITION_DISCRIMINATOR)],
	).encode({ computationOffset: _args.computationOffset, mxeNonce: _args.mxeNonce });
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makePrivateTradeIx = (
	_args: MakePrivateTradeIxArguments,
	_accounts: MakePrivateTradeIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const PRIVATE_TRADE_DISCRIMINATOR = new Uint8Array([129, 42, 123, 125, 123, 3, 247, 13]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['computationOffset', getU64Encoder()],
			['tradeCiphertext', fixEncoderSize(getBytesEncoder(), 32)],
			['tradePubKey', fixEncoderSize(getBytesEncoder(), 32)],
			['tradeNonce', getU128Encoder()],
		]),
		[getConstantEncoder(PRIVATE_TRADE_DISCRIMINATOR)],
	).encode({
		computationOffset: _args.computationOffset,
		tradeCiphertext: _args.tradeCiphertext,
		tradePubKey: _args.tradePubKey,
		tradeNonce: _args.tradeNonce,
	});
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeUpdateUserPositionPrivateIx = (
	_args: MakeUpdateUserPositionPrivateIxArguments,
	_accounts: MakeUpdateUserPositionPrivateIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const UPDATE_USER_POSITION_PRIVATE_DISCRIMINATOR = new Uint8Array([
		190, 29, 38, 196, 108, 31, 246, 166,
	]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['computationOffset', getU64Encoder()],
			['tradeCiphertext', fixEncoderSize(getBytesEncoder(), 32)],
			['tradePubKey', fixEncoderSize(getBytesEncoder(), 32)],
			['tradeNonce', getU128Encoder()],
		]),
		[getConstantEncoder(UPDATE_USER_POSITION_PRIVATE_DISCRIMINATOR)],
	).encode({
		computationOffset: _args.computationOffset,
		tradeCiphertext: _args.tradeCiphertext,
		tradePubKey: _args.tradePubKey,
		tradeNonce: _args.tradeNonce,
	});
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeClosePositionPrivateIx = (
	_args: MakeClosePositionPrivateIxArguments,
	_accounts: MakeClosePositionPrivateIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const CLOSE_POSITION_PRIVATE_DISCRIMINATOR = new Uint8Array([
		18, 166, 88, 237, 218, 13, 238, 242,
	]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['computationOffset', getU64Encoder()],
			['closeCiphertext', fixEncoderSize(getBytesEncoder(), 32)],
			['closePubKey', fixEncoderSize(getBytesEncoder(), 32)],
			['closeNonce', getU128Encoder()],
		]),
		[getConstantEncoder(CLOSE_POSITION_PRIVATE_DISCRIMINATOR)],
	).encode({
		computationOffset: _args.computationOffset,
		closeCiphertext: _args.closeCiphertext,
		closePubKey: _args.closePubKey,
		closeNonce: _args.closeNonce,
	});
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeSwitchToPublicIx = (
	_args: MakeSwitchToPublicIxArguments,
	_accounts: MakeSwitchToPublicIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const SWITCH_TO_PUBLIC_DISCRIMINATOR = new Uint8Array([131, 38, 39, 251, 92, 189, 104, 126]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([['computationOffset', getU64Encoder()]]),
		[getConstantEncoder(SWITCH_TO_PUBLIC_DISCRIMINATOR)],
	).encode({ computationOffset: _args.computationOffset });
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makePublicTradeIx = (
	_args: MakePublicTradeIxArguments,
	_accounts: MakePublicTradeIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const PUBLIC_TRADE_DISCRIMINATOR = new Uint8Array([97, 166, 114, 209, 51, 136, 133, 98]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['usdcAmount', getU64Encoder()],
			['isBuyYes', getBooleanEncoder()],
		]),
		[getConstantEncoder(PUBLIC_TRADE_DISCRIMINATOR)],
	).encode({ usdcAmount: _args.usdcAmount, isBuyYes: _args.isBuyYes });
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeSwitchToPrivateIx = (
	_args: MakeSwitchToPrivateIxArguments,
	_accounts: MakeSwitchToPrivateIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const SWITCH_TO_PRIVATE_DISCRIMINATOR = new Uint8Array([66, 215, 34, 190, 67, 228, 88, 184]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['computationOffset', getU64Encoder()],
			['mxeNonce', getU128Encoder()],
		]),
		[getConstantEncoder(SWITCH_TO_PRIVATE_DISCRIMINATOR)],
	).encode({ computationOffset: _args.computationOffset, mxeNonce: _args.mxeNonce });
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeGetSponsorViewIx = (
	_args: MakeGetSponsorViewIxArguments,
	_accounts: MakeGetSponsorViewIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const GET_SPONSOR_VIEW_DISCRIMINATOR = new Uint8Array([225, 4, 128, 199, 133, 109, 216, 99]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['computationOffset', getU64Encoder()],
			['sponsorPubKey', fixEncoderSize(getBytesEncoder(), 32)],
		]),
		[getConstantEncoder(GET_SPONSOR_VIEW_DISCRIMINATOR)],
	).encode({ computationOffset: _args.computationOffset, sponsorPubKey: _args.sponsorPubKey });
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeGetUserPositionViewIx = (
	_args: MakeGetUserPositionViewIxArguments,
	_accounts: MakeGetUserPositionViewIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	const GET_USER_POSITION_VIEW_DISCRIMINATOR = new Uint8Array([
		123, 111, 231, 5, 108, 89, 127, 246,
	]);
	const data = getHiddenPrefixEncoder(
		getStructEncoder([
			['computationOffset', getU64Encoder()],
			['sponsorPubKey', fixEncoderSize(getBytesEncoder(), 32)],
		]),
		[getConstantEncoder(GET_USER_POSITION_VIEW_DISCRIMINATOR)],
	).encode({ computationOffset: _args.computationOffset, sponsorPubKey: _args.sponsorPubKey });
	const ix: PythiaInstruction = { programAddress, accounts: _accounts, data: data };
	return ix;
};

export const makeResolveMarketIx = (
	_args: MakeResolveMarketIxArguments,
	_accounts: MakeResolveMarketIxAccounts,
): PythiaInstruction => {
	const programAddress = address(PYTHIA_PROGRAM_ID);
	// Anchor 8-byte discriminator for `resolve_market`
	const RESOLVE_MARKET_DISCRIMINATOR = new Uint8Array([155, 23, 80, 173, 46, 74, 23, 239]);
	const data = getHiddenPrefixEncoder(getBooleanEncoder(), [
		getConstantEncoder(RESOLVE_MARKET_DISCRIMINATOR),
	]).encode(_args.outcome);
	const ix: PythiaInstruction = {
		programAddress,
		accounts: _accounts,
		data,
	};
	return ix;
};

// ROUGH TO-DO
// POPULATE DATA FIELDS: ANCHOR DISCRIMINAOR, COMPUTATION OFFSET?
// INSTRUCTION PLAN
// TRANSACTION PLAN
// PDA??
