import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { PrivyProvider } from '@privy-io/react-auth';
import { SolanaKitProvider } from './providers/SolanaKitProvider';
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter>
			<PrivyProvider
				appId={import.meta.env.VITE_PRIVY_APP_ID}
				clientId={import.meta.env.VITE_PRIVY_CLIENT_ID}
				config={{
					embeddedWallets: {
						solana: {
							createOnLogin: 'users-without-wallets',
						},
					},
					solana: {
						rpcs: {
							'solana:mainnet': {
								rpc: createSolanaRpc(
									(import.meta.env.VITE_SOLANA_MAINNET_RPC_URL as string) ||
										'https://api.mainnet-beta.solana.com',
								),
								rpcSubscriptions: createSolanaRpcSubscriptions(
									(import.meta.env.VITE_SOLANA_MAINNET_WSS_URL as string) ||
										'wss://api.mainnet-beta.solana.com',
								),
							},
							'solana:devnet': {
								rpc: createSolanaRpc(
									(import.meta.env.VITE_SOLANA_DEVNET_RPC_URL as string) ||
										'https://api.devnet.solana.com',
								),
								rpcSubscriptions: createSolanaRpcSubscriptions(
									(import.meta.env.VITE_SOLANA_DEVNET_WSS_URL as string) ||
										'wss://api.devnet.solana.com',
								),
							},
						},
					},
				}}
			>
				<SolanaKitProvider>
					<App />
				</SolanaKitProvider>
			</PrivyProvider>
		</BrowserRouter>
	</StrictMode>,
);
