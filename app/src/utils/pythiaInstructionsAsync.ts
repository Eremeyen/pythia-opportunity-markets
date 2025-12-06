import { PYTHIA_OP_PROGRAM_ADDRESS } from '../../../clients/js/src/generated/programs';
import * as Pythia from '../../../clients/js/src/generated/instructions';

// ========== Type aliases (Async) ==========
// Arguments types are identical to sync (instruction data args).
// Input types include both accounts and instruction data; the comments below document
// which fields are required vs optional for each builder.

export type MakeInitSponsorIxAsyncArguments = Pythia.InitSponsorInstructionDataArgs;
/**
 * Input for initSponsor (accounts + args).
 * Required accounts: authority (signer)
 * Optional accounts: sponsor (auto-derived PDA), systemProgram (defaults to system id)
 * Instruction args: name
 */
export type MakeInitSponsorIxAsyncInput = Pythia.InitSponsorAsyncInput;

export type MakeWhitelistSponsorIxAsyncArguments = Pythia.WhitelistSponsorInstructionDataArgs;
/**
 * Input for whitelistSponsor.
 * Required accounts: admin (signer), sponsor
 * Optional accounts: none
 * Instruction args: none
 */
export type MakeWhitelistSponsorIxAsyncInput = Pythia.WhitelistSponsorInput;

export type MakeInitInitializeMarketCompDefIxAsyncArguments =
	Pythia.InitInitializeMarketCompDefInstructionDataArgs;
/**
 * Input for init_initialize_market_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitInitializeMarketCompDefIxAsyncInput = Pythia.InitInitializeMarketCompDefInput;

export type MakeInitInitializeUserPositionCompDefIxAsyncArguments =
	Pythia.InitInitializeUserPositionCompDefInstructionDataArgs;
/**
 * Input for init_initialize_user_position_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitInitializeUserPositionCompDefIxAsyncInput =
	Pythia.InitInitializeUserPositionCompDefInput;

export type MakeInitProcessPrivateTradeCompDefIxAsyncArguments =
	Pythia.InitProcessPrivateTradeCompDefInstructionDataArgs;
/**
 * Input for init_process_private_trade_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitProcessPrivateTradeCompDefIxAsyncInput =
	Pythia.InitProcessPrivateTradeCompDefInput;

export type MakeInitUpdateUserPositionCompDefIxAsyncArguments =
	Pythia.InitUpdateUserPositionCompDefInstructionDataArgs;
/**
 * Input for init_update_user_position_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitUpdateUserPositionCompDefIxAsyncInput =
	Pythia.InitUpdateUserPositionCompDefInput;

export type MakeInitClosePositionCompDefIxAsyncArguments =
	Pythia.InitClosePositionCompDefInstructionDataArgs;
/**
 * Input for init_close_position_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitClosePositionCompDefIxAsyncInput = Pythia.InitClosePositionCompDefInput;

export type MakeInitRevealMarketStateCompDefIxAsyncArguments =
	Pythia.InitRevealMarketStateCompDefInstructionDataArgs;
/**
 * Input for init_reveal_market_state_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitRevealMarketStateCompDefIxAsyncInput =
	Pythia.InitRevealMarketStateCompDefInput;

export type MakeInitRevealUserPositionCompDefIxAsyncArguments =
	Pythia.InitRevealUserPositionCompDefInstructionDataArgs;
/**
 * Input for init_reveal_user_position_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitRevealUserPositionCompDefIxAsyncInput =
	Pythia.InitRevealUserPositionCompDefInput;

export type MakeInitHideMarketStateCompDefIxAsyncArguments =
	Pythia.InitHideMarketStateCompDefInstructionDataArgs;
/**
 * Input for init_hide_market_state_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitHideMarketStateCompDefIxAsyncInput = Pythia.InitHideMarketStateCompDefInput;

export type MakeInitViewMarketStateCompDefIxAsyncArguments =
	Pythia.InitViewMarketStateCompDefInstructionDataArgs;
/**
 * Input for init_view_market_state_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitViewMarketStateCompDefIxAsyncInput = Pythia.InitViewMarketStateCompDefInput;

export type MakeInitViewUserPositionCompDefIxAsyncArguments =
	Pythia.InitViewUserPositionCompDefInstructionDataArgs;
/**
 * Input for init_view_user_position_comp_def.
 * Required accounts: payer (signer), mxeAccount, compDefAccount
 * Optional accounts: arciumProgram, systemProgram
 * Instruction args: none
 */
export type MakeInitViewUserPositionCompDefIxAsyncInput =
	Pythia.InitViewUserPositionCompDefInput;

export type MakeInitializeMarketIxAsyncArguments = Pythia.InitMarketInstructionDataArgs;
/**
 * Input for initMarket.
 * Required accounts: sponsor (signer), sponsorAccount
 * Optional accounts: market (auto-derived PDA), systemProgram
 * Instruction args: question, resolutionDate, liquidityCap, initialLiquidityUsdc,
 *   oppWindowDuration, pubWindowDuration
 */
export type MakeInitializeMarketIxAsyncInput = Pythia.InitMarketAsyncInput;

export type MakeInitializeMarketEncryptedIxAsyncArguments =
	Pythia.InitMarketEncryptedInstructionDataArgs;
/**
 * Input for initMarketEncrypted.
 * Required accounts: payer (signer), market, mxeAccount, mempoolAccount, executingPool,
 *   computationAccount, compDefAccount, clusterAccount
 * Optional accounts: signPdaAccount, poolAccount, clockAccount, systemProgram, arciumProgram
 * Instruction args: computationOffset, initialLiquidityUsdc, mxeNonce
 */
export type MakeInitializeMarketEncryptedIxAsyncInput = Pythia.InitMarketEncryptedAsyncInput;

export type MakeInitUserPositionIxAsyncArguments = Pythia.InitUserPositionInstructionDataArgs;
/**
 * Input for initUserPosition.
 * Required accounts: user (signer), market, userPosition
 * Optional accounts: systemProgram
 * Instruction args: computationOffset, userPositionNonce
 */
export type MakeInitUserPositionIxAsyncInput = Pythia.InitUserPositionAsyncInput;

export type MakePrivateTradeIxAsyncArguments = Pythia.TradePrivateInstructionDataArgs;
/**
 * Input for tradePrivate.
 * Required accounts: payer (signer), market, mxeAccount, mempoolAccount, executingPool,
 *   computationAccount, compDefAccount, clusterAccount
 * Optional accounts: signPdaAccount, poolAccount, clockAccount, systemProgram, arciumProgram
 * Instruction args: computationOffset, tradeCiphertext, tradePubKey, tradeNonce
 */
export type MakePrivateTradeIxAsyncInput = Pythia.TradePrivateAsyncInput;

export type MakeUpdateUserPositionPrivateIxAsyncArguments =
	Pythia.UpdateUserPositionPrivateInstructionDataArgs;
/**
 * Input for updateUserPositionPrivate.
 * Required accounts: payer (signer), market, userPosition, mxeAccount, mempoolAccount,
 *   executingPool, computationAccount, compDefAccount, clusterAccount
 * Optional accounts: signPdaAccount, poolAccount, clockAccount, systemProgram, arciumProgram
 * Instruction args: computationOffset, positionCiphertext, traderPublicKey, traderNonce
 */
export type MakeUpdateUserPositionPrivateIxAsyncInput = Pythia.UpdateUserPositionPrivateAsyncInput;

export type MakeClosePositionPrivateIxAsyncArguments =
	Pythia.ClosePositionPrivateInstructionDataArgs;
/**
 * Input for closePositionPrivate.
 * Required accounts: payer (signer), market, userPosition, mxeAccount, mempoolAccount,
 *   executingPool, computationAccount, compDefAccount, clusterAccount
 * Optional accounts: signPdaAccount, poolAccount, clockAccount, systemProgram, arciumProgram
 * Instruction args: computationOffset, closeCiphertext, traderPublicKey, traderNonce
 */
export type MakeClosePositionPrivateIxAsyncInput = Pythia.ClosePositionPrivateAsyncInput;

export type MakeSwitchToPublicIxAsyncArguments = Pythia.SwitchToPublicInstructionDataArgs;
/**
 * Input for switchToPublic.
 * Required accounts: payer (signer), market, mxeAccount, mempoolAccount, executingPool,
 *   computationAccount, compDefAccount, clusterAccount
 * Optional accounts: signPdaAccount, poolAccount, clockAccount, systemProgram, arciumProgram
 * Instruction args: computationOffset
 */
export type MakeSwitchToPublicIxAsyncInput = Pythia.SwitchToPublicAsyncInput;

export type MakePublicTradeIxAsyncArguments = Pythia.TradePublicInstructionDataArgs;
/**
 * Input for tradePublic.
 * Required accounts: trader (signer), market
 * Optional accounts: none
 * Instruction args: usdcAmount, isBuyYes
 */
export type MakePublicTradeIxAsyncInput = Pythia.TradePublicInput;

export type MakeSwitchToPrivateIxAsyncArguments = Pythia.SwitchToPrivateInstructionDataArgs;
/**
 * Input for switchToPrivate.
 * Required accounts: payer (signer), market, mxeAccount, mempoolAccount, executingPool,
 *   computationAccount, compDefAccount, clusterAccount
 * Optional accounts: signPdaAccount, poolAccount, clockAccount, systemProgram, arciumProgram
 * Instruction args: computationOffset
 */
export type MakeSwitchToPrivateIxAsyncInput = Pythia.SwitchToPrivateAsyncInput;

export type MakeGetSponsorViewIxAsyncArguments = Pythia.GetSponsorViewInstructionDataArgs;
/**
 * Input for getSponsorView.
 * Required accounts: sponsor (signer), market, sponsorAccount
 * Optional accounts: systemProgram
 * Instruction args: none
 */
export type MakeGetSponsorViewIxAsyncInput = Pythia.GetSponsorViewAsyncInput;

export type MakeGetUserPositionViewIxAsyncArguments = Pythia.GetUserPositionViewInstructionDataArgs;
/**
 * Input for getUserPositionView.
 * Required accounts: user (signer), market, userPosition
 * Optional accounts: none
 * Instruction args: none
 */
export type MakeGetUserPositionViewIxAsyncInput = Pythia.GetUserPositionViewAsyncInput;

export type MakeResolveMarketIxAsyncArguments = Pythia.ResolveMarketInstructionDataArgs;
/**
 * Input for resolveMarket.
 * Required accounts: resolver (signer), market
 * Optional accounts: none
 * Instruction args: resolution (variant specific)
 */
export type MakeResolveMarketIxAsyncInput = Pythia.ResolveMarketInput;

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
 *   await makeInitSponsorIxAsync({ authority, name: 'Acme' })
 */
export const makeInitSponsorIxAsync = async (
	_input: MakeInitSponsorIxAsyncInput,
) => {
	const instruction = await Pythia.getInitSponsorInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
	_accounts: MakeWhitelistSponsorIxAsyncInput,
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
	_accounts: MakeInitInitializeMarketCompDefIxAsyncInput,
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
	_accounts: MakeInitInitializeUserPositionCompDefIxAsyncInput,
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
	_accounts: MakeInitProcessPrivateTradeCompDefIxAsyncInput,
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
	_accounts: MakeInitUpdateUserPositionCompDefIxAsyncInput,
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
	_accounts: MakeInitClosePositionCompDefIxAsyncInput,
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
	_accounts: MakeInitRevealMarketStateCompDefIxAsyncInput,
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
	_accounts: MakeInitRevealUserPositionCompDefIxAsyncInput,
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
	_accounts: MakeInitHideMarketStateCompDefIxAsyncInput,
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
	_accounts: MakeInitViewMarketStateCompDefIxAsyncInput,
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
	_accounts: MakeInitViewUserPositionCompDefIxAsyncInput,
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
 *   await makeInitializeMarketIxAsync({ sponsor, sponsorAccount, ...args })
 */
export const makeInitializeMarketIxAsync = async (
	_input: MakeInitializeMarketIxAsyncInput,
) => {
	const instruction = await Pythia.getInitMarketInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
 *   await makeInitializeMarketEncryptedIxAsync({ payer, market, ...args })
 */
export const makeInitializeMarketEncryptedIxAsync = async (
	_input: MakeInitializeMarketEncryptedIxAsyncInput,
) => {
	const instruction = await Pythia.getInitMarketEncryptedInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
 *   await makeInitUserPositionIxAsync({ user, market, ...args })
 */
export const makeInitUserPositionIxAsync = async (
	_input: MakeInitUserPositionIxAsyncInput,
) => {
	const instruction = await Pythia.getInitUserPositionInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
 *   await makePrivateTradeIxAsync({ payer, market, ...args })
 */
export const makePrivateTradeIxAsync = async (
	_input: MakePrivateTradeIxAsyncInput,
) => {
	const instruction = await Pythia.getTradePrivateInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
	_input: MakeUpdateUserPositionPrivateIxAsyncInput,
) => {
	const instruction = await Pythia.getUpdateUserPositionPrivateInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
	_input: MakeClosePositionPrivateIxAsyncInput,
) => {
	const instruction = await Pythia.getClosePositionPrivateInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
	_input: MakeSwitchToPublicIxAsyncInput,
) => {
	const instruction = await Pythia.getSwitchToPublicInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
	_input: MakePublicTradeIxAsyncInput,
) => {
	const instruction = Pythia.getTradePublicInstruction(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
	_input: MakeSwitchToPrivateIxAsyncInput,
) => {
	const instruction = await Pythia.getSwitchToPrivateInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
	_input: MakeGetSponsorViewIxAsyncInput,
) => {
	const instruction = await Pythia.getGetSponsorViewInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
	_input: MakeGetUserPositionViewIxAsyncInput,
) => {
	const instruction = await Pythia.getGetUserPositionViewInstructionAsync(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
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
	_input: MakeResolveMarketIxAsyncInput,
) => {
	const instruction = Pythia.getResolveMarketInstruction(_input, {
		programAddress: PYTHIA_OP_PROGRAM_ADDRESS,
	});
	return instruction;
};
