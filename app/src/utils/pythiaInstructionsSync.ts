import { PYTHIA_OP_PROGRAM_ADDRESS } from '../../../clients/js/src/generated/programs';
import * as Pythia from '../../../clients/js/src/generated/instructions';

export type MakeInitSponsorIxArguments = Pythia.InitSponsorInstructionDataArgs;

// type PythiaInstruction = Instruction<typeof PYTHIA_OP_PROGRAM_ADDRESS>;
// import { type Instruction } from '@solana/kit';

export type MakeInitSponsorIxAccounts = Pythia.InitSponsorInput;
export type MakeWhitelistSponsorIxAccounts = Pythia.WhitelistSponsorInput;
export type MakeInitInitializeMarketCompDefIxAccounts = Pythia.InitInitializeMarketCompDefInput;
export type MakeInitInitializeUserPositionCompDefIxAccounts =
	Pythia.InitInitializeUserPositionCompDefInput;
export type MakeInitProcessPrivateTradeCompDefIxAccounts =
	Pythia.InitProcessPrivateTradeCompDefInput;
export type MakeInitUpdateUserPositionCompDefIxAccounts = Pythia.InitUpdateUserPositionCompDefInput;
export type MakeInitClosePositionCompDefIxAccounts = Pythia.InitClosePositionCompDefInput;
export type MakeInitRevealMarketStateCompDefIxAccounts = Pythia.InitRevealMarketStateCompDefInput;
export type MakeInitRevealUserPositionCompDefIxAccounts = Pythia.InitRevealUserPositionCompDefInput;
export type MakeInitHideMarketStateCompDefIxAccounts = Pythia.InitHideMarketStateCompDefInput;
export type MakeInitViewMarketStateCompDefIxAccounts = Pythia.InitViewMarketStateCompDefInput;
export type MakeInitViewUserPositionCompDefIxAccounts = Pythia.InitViewUserPositionCompDefInput;

export type MakeInitializeMarketIxArguments = Pythia.InitMarketInstructionDataArgs;

export type MakeInitializeMarketIxAccounts = Pythia.InitMarketInput;

export type MakeInitializeMarketEncryptedIxArguments =
	Pythia.InitMarketEncryptedInstructionDataArgs;

export type MakeInitializeMarketEncryptedIxAccounts = Pythia.InitMarketEncryptedInput;

export type MakeInitUserPositionIxArguments = Pythia.InitUserPositionInstructionDataArgs;

export type MakeInitUserPositionIxAccounts = Pythia.InitUserPositionInput;

export type MakePrivateTradeIxArguments = Pythia.TradePrivateInstructionDataArgs;

export type MakePrivateTradeIxAccounts = Pythia.TradePrivateInput;

export type MakeUpdateUserPositionPrivateIxArguments =
	Pythia.UpdateUserPositionPrivateInstructionDataArgs;

export type MakeUpdateUserPositionPrivateIxAccounts = Pythia.UpdateUserPositionPrivateInput;

export type MakeClosePositionPrivateIxArguments = Pythia.ClosePositionPrivateInstructionDataArgs;

export type MakeClosePositionPrivateIxAccounts = Pythia.ClosePositionPrivateInput;

export type MakeSwitchToPublicIxArguments = Pythia.SwitchToPublicInstructionDataArgs;

export type MakeSwitchToPublicIxAccounts = Pythia.SwitchToPublicInput;

export type MakePublicTradeIxArguments = Pythia.TradePublicInstructionDataArgs;

export type MakePublicTradeIxAccounts = Pythia.TradePublicInput;

export type MakeSwitchToPrivateIxArguments = Pythia.SwitchToPrivateInstructionDataArgs;

export type MakeSwitchToPrivateIxAccounts = Pythia.SwitchToPrivateInput;

export type MakeGetSponsorViewIxArguments = Pythia.GetSponsorViewInstructionDataArgs;

export type MakeGetSponsorViewIxAccounts = Pythia.GetSponsorViewInput;

export type MakeGetUserPositionViewIxArguments = Pythia.GetUserPositionViewInstructionDataArgs;

export type MakeGetUserPositionViewIxAccounts = Pythia.GetUserPositionViewInput;

export type MakeResolveMarketIxArguments = Pythia.ResolveMarketInstructionDataArgs;

export type MakeResolveMarketIxAccounts = Pythia.ResolveMarketInput;

export const makeInitSponsorIxSync = (
	_args: MakeInitSponsorIxArguments,
	_accounts: MakeInitSponsorIxAccounts,
) => {
	return Pythia.getInitSponsorInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeWhitelistSponsorIxSync = (_accounts: MakeWhitelistSponsorIxAccounts) => {
	return Pythia.getWhitelistSponsorInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitInitializeMarketCompDefIxSync = (
	_accounts: MakeInitInitializeMarketCompDefIxAccounts,
) => {
	return Pythia.getInitInitializeMarketCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitInitializeUserPositionCompDefIxSync = (
	_accounts: MakeInitInitializeUserPositionCompDefIxAccounts,
) => {
	return Pythia.getInitInitializeUserPositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitProcessPrivateTradeCompDefIxSync = (
	_accounts: MakeInitProcessPrivateTradeCompDefIxAccounts,
) => {
	return Pythia.getInitProcessPrivateTradeCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitUpdateUserPositionCompDefIxSync = (
	_accounts: MakeInitUpdateUserPositionCompDefIxAccounts,
) => {
	return Pythia.getInitUpdateUserPositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitClosePositionCompDefIxSync = (
	_accounts: MakeInitClosePositionCompDefIxAccounts,
) => {
	return Pythia.getInitClosePositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitRevealMarketStateCompDefIxSync = (
	_accounts: MakeInitRevealMarketStateCompDefIxAccounts,
) => {
	return Pythia.getInitRevealMarketStateCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitRevealUserPositionCompDefIxSync = (
	_accounts: MakeInitRevealUserPositionCompDefIxAccounts,
) => {
	return Pythia.getInitRevealUserPositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitHideMarketStateCompDefIxSync = (
	_accounts: MakeInitHideMarketStateCompDefIxAccounts,
) => {
	return Pythia.getInitHideMarketStateCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitViewMarketStateCompDefIxSync = (
	_accounts: MakeInitViewMarketStateCompDefIxAccounts,
) => {
	return Pythia.getInitViewMarketStateCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitViewUserPositionCompDefIxSync = (
	_accounts: MakeInitViewUserPositionCompDefIxAccounts,
) => {
	return Pythia.getInitViewUserPositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
};

export const makeInitializeMarketIxSync = (
	_args: MakeInitializeMarketIxArguments,
	_accounts: MakeInitializeMarketIxAccounts,
) => {
	return Pythia.getInitMarketInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeInitializeMarketEncryptedIxSync = (
	_args: MakeInitializeMarketEncryptedIxArguments,
	_accounts: MakeInitializeMarketEncryptedIxAccounts,
) => {
	return Pythia.getInitMarketEncryptedInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeInitUserPositionIxSync = (
	_args: MakeInitUserPositionIxArguments,
	_accounts: MakeInitUserPositionIxAccounts,
) => {
	return Pythia.getInitUserPositionInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makePrivateTradeIxSync = (
	_args: MakePrivateTradeIxArguments,
	_accounts: MakePrivateTradeIxAccounts,
) => {
	return Pythia.getTradePrivateInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeUpdateUserPositionPrivateIxSync = (
	_args: MakeUpdateUserPositionPrivateIxArguments,
	_accounts: MakeUpdateUserPositionPrivateIxAccounts,
) => {
	return Pythia.getUpdateUserPositionPrivateInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeClosePositionPrivateIxSync = (
	_args: MakeClosePositionPrivateIxArguments,
	_accounts: MakeClosePositionPrivateIxAccounts,
) => {
	return Pythia.getClosePositionPrivateInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeSwitchToPublicIxSync = (
	_args: MakeSwitchToPublicIxArguments,
	_accounts: MakeSwitchToPublicIxAccounts,
) => {
	return Pythia.getSwitchToPublicInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makePublicTradeIxSync = (
	_args: MakePublicTradeIxArguments,
	_accounts: MakePublicTradeIxAccounts,
) => {
	return Pythia.getTradePublicInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeSwitchToPrivateIxSync = (
	_args: MakeSwitchToPrivateIxArguments,
	_accounts: MakeSwitchToPrivateIxAccounts,
) => {
	return Pythia.getSwitchToPrivateInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeGetSponsorViewIxSync = (
	_args: MakeGetSponsorViewIxArguments,
	_accounts: MakeGetSponsorViewIxAccounts,
) => {
	return Pythia.getGetSponsorViewInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeGetUserPositionViewIxSync = (
	_args: MakeGetUserPositionViewIxArguments,
	_accounts: MakeGetUserPositionViewIxAccounts,
) => {
	return Pythia.getGetUserPositionViewInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};

export const makeResolveMarketIxSync = (
	_args: MakeResolveMarketIxArguments,
	_accounts: MakeResolveMarketIxAccounts,
) => {
	return Pythia.getResolveMarketInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
};
