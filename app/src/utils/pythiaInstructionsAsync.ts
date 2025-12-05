import { PYTHIA_OP_PROGRAM_ADDRESS } from '../../../clients/js/src/generated/programs';
import * as Pythia from '../../../clients/js/src/generated/instructions';

// ========== Type aliases (Async) ==========
// Arguments types are identical to sync (instruction data args).
// Accounts types use AsyncInput when available; otherwise fall back to Input.

export type MakeInitSponsorIxAsyncArguments = Pythia.InitSponsorInstructionDataArgs;
export type MakeInitSponsorIxAsyncAccounts = Pythia.InitSponsorAsyncInput;

export type MakeWhitelistSponsorIxAsyncArguments = Pythia.WhitelistSponsorInstructionDataArgs;
export type MakeWhitelistSponsorIxAsyncAccounts = Pythia.WhitelistSponsorInput;

export type MakeInitInitializeMarketCompDefIxAsyncArguments =
	Pythia.InitInitializeMarketCompDefInstructionDataArgs;
export type MakeInitInitializeMarketCompDefIxAsyncAccounts =
	Pythia.InitInitializeMarketCompDefInput;

export type MakeInitInitializeUserPositionCompDefIxAsyncArguments =
	Pythia.InitInitializeUserPositionCompDefInstructionDataArgs;
export type MakeInitInitializeUserPositionCompDefIxAsyncAccounts =
	Pythia.InitInitializeUserPositionCompDefInput;

export type MakeInitProcessPrivateTradeCompDefIxAsyncArguments =
	Pythia.InitProcessPrivateTradeCompDefInstructionDataArgs;
export type MakeInitProcessPrivateTradeCompDefIxAsyncAccounts =
	Pythia.InitProcessPrivateTradeCompDefInput;

export type MakeInitUpdateUserPositionCompDefIxAsyncArguments =
	Pythia.InitUpdateUserPositionCompDefInstructionDataArgs;
export type MakeInitUpdateUserPositionCompDefIxAsyncAccounts =
	Pythia.InitUpdateUserPositionCompDefInput;

export type MakeInitClosePositionCompDefIxAsyncArguments =
	Pythia.InitClosePositionCompDefInstructionDataArgs;
export type MakeInitClosePositionCompDefIxAsyncAccounts = Pythia.InitClosePositionCompDefInput;

export type MakeInitRevealMarketStateCompDefIxAsyncArguments =
	Pythia.InitRevealMarketStateCompDefInstructionDataArgs;
export type MakeInitRevealMarketStateCompDefIxAsyncAccounts =
	Pythia.InitRevealMarketStateCompDefInput;

export type MakeInitRevealUserPositionCompDefIxAsyncArguments =
	Pythia.InitRevealUserPositionCompDefInstructionDataArgs;
export type MakeInitRevealUserPositionCompDefIxAsyncAccounts =
	Pythia.InitRevealUserPositionCompDefInput;

export type MakeInitHideMarketStateCompDefIxAsyncArguments =
	Pythia.InitHideMarketStateCompDefInstructionDataArgs;
export type MakeInitHideMarketStateCompDefIxAsyncAccounts = Pythia.InitHideMarketStateCompDefInput;

export type MakeInitViewMarketStateCompDefIxAsyncArguments =
	Pythia.InitViewMarketStateCompDefInstructionDataArgs;
export type MakeInitViewMarketStateCompDefIxAsyncAccounts = Pythia.InitViewMarketStateCompDefInput;

export type MakeInitViewUserPositionCompDefIxAsyncArguments =
	Pythia.InitViewUserPositionCompDefInstructionDataArgs;
export type MakeInitViewUserPositionCompDefIxAsyncAccounts =
	Pythia.InitViewUserPositionCompDefInput;

export type MakeInitializeMarketIxAsyncArguments = Pythia.InitMarketInstructionDataArgs;
export type MakeInitializeMarketIxAsyncAccounts = Pythia.InitMarketAsyncInput;

export type MakeInitializeMarketEncryptedIxAsyncArguments =
	Pythia.InitMarketEncryptedInstructionDataArgs;
export type MakeInitializeMarketEncryptedIxAsyncAccounts = Pythia.InitMarketEncryptedAsyncInput;

export type MakeInitUserPositionIxAsyncArguments = Pythia.InitUserPositionInstructionDataArgs;
export type MakeInitUserPositionIxAsyncAccounts = Pythia.InitUserPositionAsyncInput;

export type MakePrivateTradeIxAsyncArguments = Pythia.TradePrivateInstructionDataArgs;
export type MakePrivateTradeIxAsyncAccounts = Pythia.TradePrivateAsyncInput;

export type MakeUpdateUserPositionPrivateIxAsyncArguments =
	Pythia.UpdateUserPositionPrivateInstructionDataArgs;
export type MakeUpdateUserPositionPrivateIxAsyncAccounts =
	Pythia.UpdateUserPositionPrivateAsyncInput;

export type MakeClosePositionPrivateIxAsyncArguments =
	Pythia.ClosePositionPrivateInstructionDataArgs;
export type MakeClosePositionPrivateIxAsyncAccounts = Pythia.ClosePositionPrivateAsyncInput;

export type MakeSwitchToPublicIxAsyncArguments = Pythia.SwitchToPublicInstructionDataArgs;
export type MakeSwitchToPublicIxAsyncAccounts = Pythia.SwitchToPublicAsyncInput;

export type MakePublicTradeIxAsyncArguments = Pythia.TradePublicInstructionDataArgs;
export type MakePublicTradeIxAsyncAccounts = Pythia.TradePublicInput;

export type MakeSwitchToPrivateIxAsyncArguments = Pythia.SwitchToPrivateInstructionDataArgs;
export type MakeSwitchToPrivateIxAsyncAccounts = Pythia.SwitchToPrivateAsyncInput;

export type MakeGetSponsorViewIxAsyncArguments = Pythia.GetSponsorViewInstructionDataArgs;
export type MakeGetSponsorViewIxAsyncAccounts = Pythia.GetSponsorViewAsyncInput;

export type MakeGetUserPositionViewIxAsyncArguments = Pythia.GetUserPositionViewInstructionDataArgs;
export type MakeGetUserPositionViewIxAsyncAccounts = Pythia.GetUserPositionViewAsyncInput;

export type MakeResolveMarketIxAsyncArguments = Pythia.ResolveMarketInstructionDataArgs;
export type MakeResolveMarketIxAsyncAccounts = Pythia.ResolveMarketInput;

// ========== Builders (Async) ==========

/**
 * Init sponsor (async)
 * Args:
 * - name: string
 * Accounts:
 * - required: authority (signer)
 * - optional (auto): sponsor (PDA: seeds ["sponsor", authority]), systemProgram
 * Auto-resolves:
 * - sponsor PDA if omitted (seeds: ["sponsor", authority])
 * - systemProgram defaults
 * Example:
 *   await makeInitSponsorIxAsync({ name: 'Acme' }, { authority })
 */
export const makeInitSponsorIxAsync = async (
	_args: MakeInitSponsorIxAsyncArguments,
	_accounts: MakeInitSponsorIxAsyncAccounts,
) => {
	const instruction = await Pythia.getInitSponsorInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Whitelist sponsor (async facade)
 * Args: none
 * Accounts:
 * - required: admin (signer), sponsor (address)
 * Note: No async client builder; this returns a resolved sync instruction.
 */
export const makeWhitelistSponsorIxAsync = async (
	_accounts: MakeWhitelistSponsorIxAsyncAccounts,
) => {
	const instruction = Pythia.getWhitelistSponsorInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * Initialize Market Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitInitializeMarketCompDefIxAsync = async (
	_accounts: MakeInitInitializeMarketCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitInitializeMarketCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * Initialize User Position Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitInitializeUserPositionCompDefIxAsync = async (
	_accounts: MakeInitInitializeUserPositionCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitInitializeUserPositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * Process Private Trade Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitProcessPrivateTradeCompDefIxAsync = async (
	_accounts: MakeInitProcessPrivateTradeCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitProcessPrivateTradeCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * Update User Position Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitUpdateUserPositionCompDefIxAsync = async (
	_accounts: MakeInitUpdateUserPositionCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitUpdateUserPositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * Close Position Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitClosePositionCompDefIxAsync = async (
	_accounts: MakeInitClosePositionCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitClosePositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * Reveal Market State Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitRevealMarketStateCompDefIxAsync = async (
	_accounts: MakeInitRevealMarketStateCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitRevealMarketStateCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * Reveal User Position Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitRevealUserPositionCompDefIxAsync = async (
	_accounts: MakeInitRevealUserPositionCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitRevealUserPositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * Hide Market State Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitHideMarketStateCompDefIxAsync = async (
	_accounts: MakeInitHideMarketStateCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitHideMarketStateCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * View Market State Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitViewMarketStateCompDefIxAsync = async (
	_accounts: MakeInitViewMarketStateCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitViewMarketStateCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * View User Position Comp Definition (async facade)
 * Args: none
 * Accounts:
 * - required: payer (signer), mxeAccount, compDefAccount
 * - optional (auto): arciumProgram, systemProgram
 */
export const makeInitViewUserPositionCompDefIxAsync = async (
	_accounts: MakeInitViewUserPositionCompDefIxAsyncAccounts,
) => {
	const instruction = Pythia.getInitViewUserPositionCompDefInstruction(_accounts, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};

/**
 * Initialize market (async)
 * Args:
 * - question: string
 * - resolutionDate: number | bigint
 * - liquidityCap: number | bigint
 * - initialLiquidityUsdc: number | bigint
 * - oppWindowDuration: number | bigint
 * - pubWindowDuration: number | bigint
 * Accounts:
 * - required: sponsor (signer), sponsorAccount
 * - optional (auto): market (PDA: seeds ["market", sponsorAccount, question]), systemProgram
 * Auto-derives market PDA when omitted.
 * Example:
 *   await makeInitializeMarketIxAsync(args, { sponsor, sponsorAccount })
 */
export const makeInitializeMarketIxAsync = async (
	_args: MakeInitializeMarketIxAsyncArguments,
	_accounts: MakeInitializeMarketIxAsyncAccounts,
) => {
	const instruction = await Pythia.getInitMarketInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Initialize market (encrypted) (async)
 * Args:
 * - computationOffset: number | bigint
 * - initialLiquidityUsdc: number | bigint
 * - mxeNonce: number | bigint
 * Accounts:
 * - required: payer (signer), market, mxeAccount, mempoolAccount, executingPool, computationAccount, compDefAccount, clusterAccount
 * - optional (auto): signPdaAccount (PDA: ["SignerAccount"]), poolAccount, clockAccount, systemProgram, arciumProgram
 * Example:
 *   await makeInitializeMarketEncryptedIxAsync(args, accounts)
 */
export const makeInitializeMarketEncryptedIxAsync = async (
	_args: MakeInitializeMarketEncryptedIxAsyncArguments,
	_accounts: MakeInitializeMarketEncryptedIxAsyncAccounts,
) => {
	const instruction = await Pythia.getInitMarketEncryptedInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Initialize user position (async)
 * Args:
 * - computationOffset: number | bigint
 * - mxeNonce: number | bigint
 * Accounts:
 * - required: user (signer), market, mxeAccount, mempoolAccount, executingPool, computationAccount, compDefAccount, clusterAccount
 * - optional (auto): userPosition (PDA: ["user_position", market, user]), signPdaAccount (PDA: ["SignerAccount"]), poolAccount, clockAccount, systemProgram, arciumProgram
 * Auto-derives userPosition/sign PDA and fills default programs.
 * Example:
 *   await makeInitUserPositionIxAsync(args, { user, market, ... })
 */
export const makeInitUserPositionIxAsync = async (
	_args: MakeInitUserPositionIxAsyncArguments,
	_accounts: MakeInitUserPositionIxAsyncAccounts,
) => {
	const instruction = await Pythia.getInitUserPositionInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Private trade (async)
 * Args:
 * - computationOffset: number | bigint
 * - tradeCiphertext: ReadonlyUint8Array (32 bytes)
 * - tradePubKey: ReadonlyUint8Array (32 bytes)
 * - tradeNonce: number | bigint
 * Accounts:
 * - required: payer (signer), market, mxeAccount, mempoolAccount, executingPool, computationAccount, compDefAccount, clusterAccount
 * - optional (auto): signPdaAccount (PDA: ["SignerAccount"]), poolAccount, clockAccount, systemProgram, arciumProgram
 * Auto-derives Sign PDA and fills default programs.
 * Example:
 *   await makePrivateTradeIxAsync(args, { payer, market, ... })
 */
export const makePrivateTradeIxAsync = async (
	_args: MakePrivateTradeIxAsyncArguments,
	_accounts: MakePrivateTradeIxAsyncAccounts,
) => {
	const instruction = await Pythia.getTradePrivateInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Update user position (private, async)
 * Args:
 * - computationOffset: number | bigint
 * - tradeCiphertext: ReadonlyUint8Array (32 bytes)
 * - tradePubKey: ReadonlyUint8Array (32 bytes)
 * - tradeNonce: number | bigint
 * Accounts:
 * - required: user (signer), market, mxeAccount, mempoolAccount, executingPool, computationAccount, compDefAccount, clusterAccount
 * - optional (auto): userPosition (PDA: ["user_position", market, user]), signPdaAccount (PDA: ["SignerAccount"]), poolAccount, clockAccount, systemProgram, arciumProgram
 * Auto-derives userPosition/sign PDA and fills defaults.
 */
export const makeUpdateUserPositionPrivateIxAsync = async (
	_args: MakeUpdateUserPositionPrivateIxAsyncArguments,
	_accounts: MakeUpdateUserPositionPrivateIxAsyncAccounts,
) => {
	const instruction = await Pythia.getUpdateUserPositionPrivateInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Close position (private, async)
 * Args:
 * - computationOffset: number | bigint
 * - closeCiphertext: ReadonlyUint8Array (32 bytes)
 * - closePubKey: ReadonlyUint8Array (32 bytes)
 * - closeNonce: number | bigint
 * Accounts:
 * - required: user (signer), market, mxeAccount, mempoolAccount, executingPool, computationAccount, compDefAccount, clusterAccount
 * - optional (auto): userPosition (PDA: ["user_position", market, user]), signPdaAccount (PDA: ["SignerAccount"]), poolAccount, clockAccount, systemProgram, arciumProgram
 * Auto-derives userPosition/sign PDA and fills defaults.
 */
export const makeClosePositionPrivateIxAsync = async (
	_args: MakeClosePositionPrivateIxAsyncArguments,
	_accounts: MakeClosePositionPrivateIxAsyncAccounts,
) => {
	const instruction = await Pythia.getClosePositionPrivateInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Switch to public window (async)
 * Args:
 * - computationOffset: number | bigint
 * Accounts:
 * - required: payer (signer), market, mxeAccount, mempoolAccount, executingPool, computationAccount, compDefAccount, clusterAccount
 * - optional (auto): signPdaAccount (PDA: ["SignerAccount"]), poolAccount, clockAccount, systemProgram, arciumProgram
 */
export const makeSwitchToPublicIxAsync = async (
	_args: MakeSwitchToPublicIxAsyncArguments,
	_accounts: MakeSwitchToPublicIxAsyncAccounts,
) => {
	const instruction = await Pythia.getSwitchToPublicInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Public trade (async facade)
 * Args:
 * - usdcAmount: number | bigint
 * - isBuyYes: boolean
 * Accounts:
 * - required: trader (signer), market
 * Note: No async client builder; this returns a resolved sync instruction.
 */
export const makePublicTradeIxAsync = async (
	_args: MakePublicTradeIxAsyncArguments,
	_accounts: MakePublicTradeIxAsyncAccounts,
) => {
	const instruction = Pythia.getTradePublicInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Switch to private window (async)
 * Args:
 * - computationOffset: number | bigint
 * - mxeNonce: number | bigint
 * Accounts:
 * - required: payer (signer), market, mxeAccount, mempoolAccount, executingPool, computationAccount, compDefAccount, clusterAccount
 * - optional (auto): signPdaAccount (PDA: ["SignerAccount"]), poolAccount, clockAccount, systemProgram, arciumProgram
 */
export const makeSwitchToPrivateIxAsync = async (
	_args: MakeSwitchToPrivateIxAsyncArguments,
	_accounts: MakeSwitchToPrivateIxAsyncAccounts,
) => {
	const instruction = await Pythia.getSwitchToPrivateInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Get sponsor view (async)
 * Args:
 * - computationOffset: number | bigint
 * - sponsorPubKey: ReadonlyUint8Array (32 bytes)
 * Accounts:
 * - required: sponsor (signer), market, mxeAccount, mempoolAccount, executingPool, computationAccount, compDefAccount, clusterAccount
 * - optional (auto): signPdaAccount (PDA: ["SignerAccount"]), poolAccount, clockAccount, systemProgram, arciumProgram
 */
export const makeGetSponsorViewIxAsync = async (
	_args: MakeGetSponsorViewIxAsyncArguments,
	_accounts: MakeGetSponsorViewIxAsyncAccounts,
) => {
	const instruction = await Pythia.getGetSponsorViewInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Get user position view (async)
 * Args:
 * - computationOffset: number | bigint
 * - sponsorPubKey: ReadonlyUint8Array (32 bytes)
 * Accounts:
 * - required: sponsor (signer), market, userPosition, mxeAccount, mempoolAccount, executingPool, computationAccount, compDefAccount, clusterAccount
 * - optional (auto): signPdaAccount (PDA: ["SignerAccount"]), poolAccount, clockAccount, systemProgram, arciumProgram
 */
export const makeGetUserPositionViewIxAsync = async (
	_args: MakeGetUserPositionViewIxAsyncArguments,
	_accounts: MakeGetUserPositionViewIxAsyncAccounts,
) => {
	const instruction = await Pythia.getGetUserPositionViewInstructionAsync(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};

/**
 * Resolve market (async facade)
 * Args:
 * - outcome: boolean
 * Accounts:
 * - required: authority (signer), market
 * Note: No async client builder; this returns a resolved sync instruction.
 */
export const makeResolveMarketIxAsync = async (
	_args: MakeResolveMarketIxAsyncArguments,
	_accounts: MakeResolveMarketIxAsyncAccounts,
) => {
	const instruction = Pythia.getResolveMarketInstruction(
		{ ..._accounts, ..._args },
		{ programAddress: PYTHIA_OP_PROGRAM_ADDRESS },
	);
	return instruction;
};
