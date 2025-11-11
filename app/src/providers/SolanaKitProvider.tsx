import { createContext, useContext, useMemo, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import {
	useSignTransaction,
	useSignAndSendTransaction,
	type UseSignTransaction,
	type UseSignAndSendTransaction,
	useWallets,
	ConnectedStandardSolanaWallet,
	// type SignTransactionInput,
	// type SignTransactionOutput,
} from '@privy-io/react-auth/solana';
import {
	createSolanaRpc,
	createSolanaRpcSubscriptions,
	sendAndConfirmTransactionFactory,
	createTransactionPlanExecutor,
	setTransactionMessageLifetimeUsingBlockhash,
	getTransactionDecoder,
	getTransactionEncoder,
	type Rpc,
	type SolanaRpcApi,
	type SolanaRpcSubscriptionsApi,
	type RpcSubscriptions,
	type Blockhash,
	type TransactionPlanExecutor,
	type TransactionMessageWithFeePayer,
	type BaseTransactionMessage,
} from '@solana/kit';
import { createTransactionPlanner, type TransactionPlanner } from '@solana/instruction-plans';
import { createTransactionMessage, setTransactionMessageFeePayer } from '@solana/transaction-messages';
import { address as toAddress } from '@solana/addresses';
import { pipe } from '@solana/functional';
import {
	fillProvisorySetComputeUnitLimitInstruction,
	estimateComputeUnitLimitFactory,
	estimateAndUpdateProvisoryComputeUnitLimitFactory,
} from '@solana-program/compute-budget';
import { assertIsSendableTransaction, compileTransaction } from '@solana/transactions';
import { NETWORK } from '../config/config';

export type SendAndConfirmTxFn = ReturnType<typeof sendAndConfirmTransactionFactory>;
type LatestBlockhashInfo = Readonly<{
	blockhash: Blockhash;
	lastValidBlockHeight: bigint;
}>;

type SolanaKitContextValue = {
	rpc: Rpc<SolanaRpcApi>;
	rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
	sendAndConfirm: SendAndConfirmTxFn | undefined; // alternatively, return a function that throws an error if the RPC is not configured
	signTransaction: UseSignTransaction['signTransaction']; // IS THIS CORRECT?
	signAndSendTransaction: UseSignAndSendTransaction['signAndSendTransaction'];
	wallet: ConnectedStandardSolanaWallet | null;
	address?: string;
	latestBlockhash?: LatestBlockhashInfo;
	executor?: TransactionPlanExecutor;
	planner?: TransactionPlanner;
	ready: boolean; // @todo would ready and authenticated change too often to be updated in a useMemo?
	authenticated: boolean;
};

const SolanaKitContext = createContext<SolanaKitContextValue | null>(null);

export function SolanaKitProvider({ children }: PropsWithChildren) {
	const httpEndpoint =
		NETWORK === 'mainnet'
			? (import.meta.env.VITE_SOLANA_MAINNET_RPC_URL as string) ||
				'https://api.mainnet-beta.solana.com'
			: (import.meta.env.VITE_SOLANA_DEVNET_RPC_URL as string) ||
				'https://api.devnet.solana.com';
	const wsEndpoint =
		NETWORK === 'mainnet'
			? (import.meta.env.VITE_SOLANA_MAINNET_WSS_URL as string) ||
				'wss://api.mainnet-beta.solana.com'
			: (import.meta.env.VITE_SOLANA_DEVNET_WSS_URL as string) ||
				'wss://api.devnet.solana.com';

	const rpc = useMemo(() => {
		return createSolanaRpc(httpEndpoint);
	}, [httpEndpoint]);

	const rpcSubscriptions = useMemo(() => {
		return createSolanaRpcSubscriptions(wsEndpoint);
	}, [wsEndpoint]);

	const sendAndConfirm = useMemo<SendAndConfirmTxFn | undefined>(() => {
		if (!rpc || !rpcSubscriptions) {
			// FAIL FAST IF RPC NOT CONFIGURED
			return undefined;
		}
		return sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
	}, [rpc, rpcSubscriptions]);

	// Privy auth + Solana/Kit wallet bridges
	const { ready, authenticated } = usePrivy();
	const { wallets } = useWallets();
	const wallet = useMemo(
		() => (ready && authenticated ? (wallets[0] as ConnectedStandardSolanaWallet) : null),
		[ready, authenticated, wallets],
	); // consider using useEffect instead
	const address = useMemo(
		() => (wallet as ConnectedStandardSolanaWallet)?.address as string | undefined,
		[wallet],
	); // consider using useEffect instead

	// FOR NOW WE DONT WRAP SIGN TRANSACTION. THIS COULD BE DONE IN COMPONENTS OR HERE LATER
	const { signTransaction } = useSignTransaction();

	// FOR NOW WE DONT WRAP SIGN AND SEND TRANSACTION. THIS COULD BE DONE IN COMPONENTS OR HERE LATER
	const { signAndSendTransaction } = useSignAndSendTransaction();

	// Poll latest blockhash every 45 seconds
	const [latestBlockhash, setLatestBlockhash] = useState<LatestBlockhashInfo | undefined>(
		undefined,
	);
	useEffect(() => {
		let isCancelled = false;
		let intervalId: ReturnType<typeof setInterval> | undefined;
		const fetchLatest = async () => {
			try {
				const {
					value: { blockhash, lastValidBlockHeight },
				} = await rpc.getLatestBlockhash().send();
				if (!isCancelled) {
					setLatestBlockhash({
						blockhash,
						lastValidBlockHeight,
					});
				}
			} catch {
				// ignore transient errors; will retry on next tick
			}
		};
		fetchLatest();
		intervalId = setInterval(fetchLatest, 45_000);
		return () => {
			isCancelled = true;
			if (intervalId) clearInterval(intervalId);
		};
	}, [rpc]);

	// Build a TransactionPlanExecutor bound to the current wallet/rpc.
	const TRANSACTION_ENCODER = getTransactionEncoder();
	const TRANSACTION_DECODER = getTransactionDecoder();
	const executor = useMemo<TransactionPlanExecutor | undefined>(() => {
		if (!sendAndConfirm || !wallet || !signTransaction || !ready || !authenticated)
			return undefined;

		const connectedWallet = wallet as ConnectedStandardSolanaWallet;
		const estimateCULimit = estimateComputeUnitLimitFactory({ rpc });
		const estimateAndSetCULimit = estimateAndUpdateProvisoryComputeUnitLimitFactory(estimateCULimit);

		return createTransactionPlanExecutor({
			executeTransactionMessage: async (
				message: BaseTransactionMessage & TransactionMessageWithFeePayer,
				config?: { abortSignal?: AbortSignal },
			) => {
				// Use cached blockhash when available; otherwise fetch.
				let blockhashLifetime = latestBlockhash;
				if (!blockhashLifetime) {
					const { value } = await rpc.getLatestBlockhash().send();
					blockhashLifetime = value;
				}

				const messageWithLifetime = setTransactionMessageLifetimeUsingBlockhash(
					blockhashLifetime,
					message,
				);

				// Estimate and set compute unit limit before signing.
				const estimatedMessage = await estimateAndSetCULimit(messageWithLifetime);

				const compiledTransaction = compileTransaction(estimatedMessage);
				const unsignedWireTransaction = TRANSACTION_ENCODER.encode(compiledTransaction);

				const signedTransaction = await signTransaction({
					transaction: new Uint8Array(unsignedWireTransaction),
					wallet: connectedWallet,
				});

				if (!signedTransaction) {
					throw new Error('Failed to sign transaction');
				}

				const decodedSignedTransaction = TRANSACTION_DECODER.decode(
					signedTransaction.signedTransaction,
				);
				const transactionWithLifetime = {
					...decodedSignedTransaction,
					lifetimeConstraint: compiledTransaction.lifetimeConstraint,
				};

				assertIsSendableTransaction(transactionWithLifetime);

				await sendAndConfirm(transactionWithLifetime, {
					commitment: 'confirmed',
					abortSignal: config?.abortSignal,
				});

				return { transaction: transactionWithLifetime };
			},
		});
	}, [authenticated, latestBlockhash, ready, rpc, sendAndConfirm, signTransaction, wallet]);

	// Build a centralized TransactionPlanner that:
	// - Creates v0 messages
	// - Sets fee payer to current wallet address
	// - Adds a provisional compute unit limit instruction for later estimation
	const planner = useMemo<TransactionPlanner | undefined>(() => {
		if (!wallet || !address) return undefined;
		const feePayerAddress = toAddress(address);
		return createTransactionPlanner({
			createTransactionMessage: () =>
				pipe(
					createTransactionMessage({ version: 0 }),
					(m) => setTransactionMessageFeePayer(feePayerAddress, m),
					(m) => fillProvisorySetComputeUnitLimitInstruction(m),
				),
			// @TODO: Optionally react to updates (e.g., set CU price, add logs).
			onTransactionMessageUpdated: (m) => m,
		});
	}, [address, wallet]);

	const value: SolanaKitContextValue = useMemo(
		() => ({
			rpc,
			rpcSubscriptions,
			sendAndConfirm,
			signTransaction,
			signAndSendTransaction,
			wallet,
			address,
			latestBlockhash,
			executor,
			planner,
			ready,
			authenticated,
		}),
		[
			rpc,
			rpcSubscriptions,
			sendAndConfirm,
			signTransaction,
			signAndSendTransaction,
			wallet,
			address,
			latestBlockhash,
			executor,
			planner,
			ready,
			authenticated,
		],
	);

	return <SolanaKitContext.Provider value={value}>{children}</SolanaKitContext.Provider>;
}

export function useSolanaKit(): SolanaKitContextValue {
	const ctx = useContext(SolanaKitContext);
	if (!ctx) {
		throw new Error('useSolanaKit must be used within a SolanaKitProvider');
	}
	return ctx;
}
