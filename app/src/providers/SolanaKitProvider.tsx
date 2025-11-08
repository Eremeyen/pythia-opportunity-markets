import { createContext, useContext, useMemo, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import {
	useStandardWallets,
	useSignTransaction,
	useSignAndSendTransaction,
	type SolanaStandardWallet,
	type UseSignTransaction,
	type UseSignAndSendTransaction,
	// type SignTransactionInput,
	// type SignTransactionOutput,
} from '@privy-io/react-auth/solana';
import {
	createSolanaRpc,
	createSolanaRpcSubscriptions,
	sendAndConfirmTransactionFactory,
	type Rpc,
	type SolanaRpcApi,
	type SolanaRpcSubscriptionsApi,
	type RpcSubscriptions,
	type Blockhash,
} from '@solana/kit';
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
	wallet: SolanaStandardWallet | null;
	address?: string;
	latestBlockhash?: LatestBlockhashInfo;
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
	const { wallets } = useStandardWallets();
	const wallet = useMemo(
		() => (ready && authenticated ? wallets[0] : null),
		[ready, authenticated, wallets],
	); // consider using useEffect instead
	const address = useMemo(() => (wallet as any)?.address as string | undefined, [wallet]); // consider using useEffect instead

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
