import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useUserAddress } from './useUserAddress';
import { SPONSOR_WHITELIST, SPONSOR_DEBUG_OVERRIDE } from '../config/mockSponsors';

export type SponsorMode = {
	isSponsor: boolean;
	whitelisted: boolean;
	overrideSource: 'param' | 'local' | null;
	mode: 'sponsor' | 'viewer';
	setSponsorOverride: (value: boolean | null) => void;
};

const LOCAL_STORAGE_KEY = 'sponsorModeOverride'; // "1" | "0" | null

export function useSponsorMode(): SponsorMode {
	const { address } = useUserAddress();
	const [searchParams, setSearchParams] = useSearchParams();
	const [localOverride, setLocalOverride] = useState<string | null>(() =>
		typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_STORAGE_KEY) : null,
	);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const val = window.localStorage.getItem(LOCAL_STORAGE_KEY);
		if (val !== localOverride) setLocalOverride(val);
	}, []);

	const paramOverride = searchParams.get('sponsor'); // "1" | "0" | null

	const whitelisted = useMemo(() => {
		if (!address) return false;
		return SPONSOR_WHITELIST.has(address);
	}, [address]);

	const isSponsor = useMemo(() => {
		if (SPONSOR_DEBUG_OVERRIDE !== null) return !!SPONSOR_DEBUG_OVERRIDE;
		if (paramOverride === '1') return true;
		if (paramOverride === '0') return false;
		if (localOverride === '1') return true;
		if (localOverride === '0') return false;
		return whitelisted;
	}, [paramOverride, localOverride, whitelisted]);

	const overrideSource: 'param' | 'local' | null = useMemo(() => {
		if (SPONSOR_DEBUG_OVERRIDE !== null) return null;
		if (paramOverride === '1' || paramOverride === '0') return 'param';
		if (localOverride === '1' || localOverride === '0') return 'local';
		return null;
	}, [paramOverride, localOverride]);

	const mode: 'sponsor' | 'viewer' = isSponsor ? 'sponsor' : 'viewer';

	function setSponsorOverride(value: boolean | null) {
		if (SPONSOR_DEBUG_OVERRIDE !== null) return; // locked in code
		if (value === null) {
			// clear local override
			if (typeof window !== 'undefined') window.localStorage.removeItem(LOCAL_STORAGE_KEY);
			setLocalOverride(null);
			// also clear query param override if present
			if (paramOverride !== null) {
				const sp = new URLSearchParams(searchParams);
				sp.delete('sponsor');
				setSearchParams(sp, { replace: true });
			}
			return;
		}
		const str = value ? '1' : '0';
		if (typeof window !== 'undefined') window.localStorage.setItem(LOCAL_STORAGE_KEY, str);
		setLocalOverride(str);
		// propagate via URL so other hook instances update immediately
		const sp = new URLSearchParams(searchParams);
		sp.set('sponsor', str);
		setSearchParams(sp, { replace: true });
	}

	return { isSponsor, whitelisted, overrideSource, mode, setSponsorOverride };
}
