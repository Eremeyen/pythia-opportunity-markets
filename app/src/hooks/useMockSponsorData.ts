import { useCallback, useEffect, useMemo, useState } from "react";
import type { SponsorMarket } from "../config/mockSponsorMarkets";
import { MOCK_SPONSOR_MARKETS, persistCreatedMarket, updatePersistedMarketResolution } from "../config/mockSponsorMarkets";
import type { Trade } from "../config/mockTrades";
import { MOCK_TRADES, generateMockTrade } from "../config/mockTrades";
import { applyResolutionToPositions } from "../config/mockPositions";
import pythiaLogoUrl from "../assets/black_pythia_logo.png";

export function useMockSponsorData(currentSponsorId: string = "sp-dev") {
  const [markets, setMarkets] = useState<SponsorMarket[]>(() => [...MOCK_SPONSOR_MARKETS]);
  const [selectedId, setSelectedId] = useState<string | null>(() => markets[0]?.id ?? null);

  const [tradesMap, setTradesMap] = useState<Record<string, Trade[]>>({ ...MOCK_TRADES });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(id);
  }, []);

  const selectedMarket = useMemo(
    () => markets.find((m) => m.id === selectedId) || null,
    [markets, selectedId]
  );

  const trades = useMemo<Trade[]>(() => {
    if (!selectedId) return [];
    return tradesMap[selectedId] ?? [];
  }, [selectedId, tradesMap]);

  const createMarket = useCallback(
    (input: {
      title: string;
      description?: string;
      liquidity: number;
      resolutionDateMs: number;
      resolutionCriteria: string;
      isPrivate: boolean;
    }) => {
      const id = `m-${Math.random().toString(36).slice(2, 9)}`;
      const now = Date.now();
      const newMarket: SponsorMarket = {
        id,
        title: input.title,
        description: input.description,
        isPriceHidden: input.isPrivate,
        isPrivate: input.isPrivate,
        opportunityEndMs: now + 7 * 24 * 3600_000,
        resultsEndMs: input.resolutionDateMs,
        // Start new markets at 10% probability with no historical series
        priceSeries: [10],
        attentionScore: 0.1,
        sponsor: { id: currentSponsorId, name: "You" },
        company: { id: `c-${id}`, name: input.title, logoUrl: pythiaLogoUrl },
        liquidity: input.liquidity,
        resolutionCriteria: input.resolutionCriteria,
        status: "open",
        resolution: null,
      } as SponsorMarket;
      setMarkets((prev) => [newMarket, ...prev]);
      setSelectedId(newMarket.id);
      // Reflect globally so other pages (Trending/Details) pick it up on navigation
      MOCK_SPONSOR_MARKETS.unshift(newMarket);
      // Persist so reload keeps the demo market
      persistCreatedMarket(newMarket);
    },
    [currentSponsorId]
  );

  const resolveMarket = useCallback((marketId: string, resolution: "YES" | "NO") => {
    setMarkets((prev) =>
      prev.map((m) => (m.id === marketId ? { ...m, status: "resolved", resolution } : m))
    );
    // Update global list used by other views
    const idx = MOCK_SPONSOR_MARKETS.findIndex((m) => m.id === marketId);
    if (idx >= 0) {
      MOCK_SPONSOR_MARKETS[idx] = {
        ...MOCK_SPONSOR_MARKETS[idx],
        status: "resolved",
        resolution,
      } as SponsorMarket;
    }
    // Persist status change
    updatePersistedMarketResolution(marketId, resolution);
    // Make any user positions in this market claimable appropriately
    applyResolutionToPositions(marketId, resolution);
  }, []);

  const appendTrade = useCallback((marketId: string, trade?: Trade) => {
    const t = trade ?? generateMockTrade(marketId);
    setTradesMap((prev) => {
      const list = prev[marketId] ?? [];
      return { ...prev, [marketId]: [...list, t] };
    });
    return t;
  }, []);

  return {
    markets,
    selectedMarket,
    selectedId,
    setSelectedId,
    trades,
    createMarket,
    resolveMarket,
    appendTrade,
    loading,
  };
}


