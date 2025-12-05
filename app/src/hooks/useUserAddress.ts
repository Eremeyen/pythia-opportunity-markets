import { useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';

function shorten(addr?: string): string {
	if (!addr) return '—';
	if (addr.length <= 10) return addr;
	return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export function useUserAddress(): {
	address?: string;
	short: string;
	ready: boolean;
} {
	const { ready, authenticated, user } = usePrivy();

	const address = useMemo(() => {
		if (!ready || !authenticated) return undefined;
		// Prefer wallet address if present; fallback to user.id/email for mock
		const wallet = user?.linkedAccounts?.find?.((a: any) => a.type === 'wallet');
		const addr = (wallet as any)?.address || (user as any)?.wallet?.address;
		return typeof addr === 'string' && addr.length > 0 ? addr : undefined;
	}, [ready, authenticated, user]);

	const short = useMemo(() => shorten(address), [address]);
	return { address, short, ready };
}
