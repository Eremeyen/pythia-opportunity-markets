import { useEffect, useMemo } from 'react';
import { useSponsorMode } from './useSponsorMode';
import { useUserAddress } from './useUserAddress';
import { getCurrentSponsorId } from '../config/sponsorIdentity';
import { useMockSponsorData } from './useMockSponsorData';
import type { SponsorMarket } from '../config/mockSponsorMarkets';

export function useSponsorMarkets() {
	const { isSponsor } = useSponsorMode();
	const { address } = useUserAddress();
	const currentSponsorId = getCurrentSponsorId(address);

	const {
		markets: allMarkets,
		selectedId,
		setSelectedId,
		createMarket,
		resolveMarket,
		loading,
	} = useMockSponsorData(currentSponsorId);

	const markets = useMemo<SponsorMarket[]>(
		() => allMarkets.filter((m) => m.sponsor?.id === currentSponsorId),
		[allMarkets, currentSponsorId],
	);

	const selectedMarket = useMemo(() => {
		if (!selectedId) return null;
		return markets.find((m) => m.id === selectedId) ?? null;
	}, [markets, selectedId]);

	// Keep selectedId within the filtered set
	useEffect(() => {
		if (selectedId && !markets.some((m) => m.id === selectedId)) {
			setSelectedId(markets[0]?.id ?? null);
		}
	}, [markets, selectedId, setSelectedId]);

	const onCreate = createMarket;
	const onResolve = resolveMarket;

	return {
		isSponsor,
		currentSponsorId,
		markets,
		selectedMarket,
		selectedId,
		setSelectedId,
		onCreate,
		onResolve,
		loading,
	};
}
