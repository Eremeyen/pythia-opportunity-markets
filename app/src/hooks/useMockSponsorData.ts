import { useCallback, useMemo, useRef, useState } from "react";
import type { SponsorMarket } from "../config/mockSponsorMarkets";
import { MOCK_SPONSOR_MARKETS } from "../config/mockSponsorMarkets";
import type { Trade } from "../config/mockTrades";
import { MOCK_TRADES, generateMockTrade } from "../config/mockTrades";

export function useMockSponsorData() {
  const [markets, setMarkets] = useState<SponsorMarket[]>(() => [...MOCK_SPONSOR_MARKETS]);
  const [selectedId, setSelectedId] = useState<string | null>(() => markets[0]?.id ?? null);

  const tradesMapRef = useRef<Record<string, Trade[]>>({ ...MOCK_TRADES });

  const selectedMarket = useMemo(
    () => markets.find((m) => m.id === selectedId) || null,
    [markets, selectedId]
  );

  const trades = useMemo<Trade[]>(() => {
    if (!selectedId) return [];
    return tradesMapRef.current[selectedId] ?? [];
  }, [selectedId]);

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
        priceSeries: [...Array(24)].map((_, i) => 100 + Math.sin(i / 3) * 2 + i * 0.3),
        attentionScore: 0.1,
        sponsor: { id: "sp-dev", name: "You" },
        company: { id: `c-${id}`, name: input.title },
        liquidity: input.liquidity,
        resolutionCriteria: input.resolutionCriteria,
        status: "open",
        resolution: null,
      } as SponsorMarket;
      setMarkets((prev) => [newMarket, ...prev]);
      setSelectedId(newMarket.id);
    },
    []
  );

  const resolveMarket = useCallback((marketId: string, resolution: "YES" | "NO") => {
    setMarkets((prev) =>
      prev.map((m) => (m.id === marketId ? { ...m, status: "resolved", resolution } : m))
    );
  }, []);

  const appendTrade = useCallback((marketId: string, trade?: Trade) => {
    const t = trade ?? generateMockTrade(marketId);
    const list = tradesMapRef.current[marketId] ?? [];
    tradesMapRef.current[marketId] = [...list, t];
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
  };
}


