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
        priceSeries: ((): number[] => {
          const out: number[] = [];
          let value = 50 + (Math.random() * 40 - 20);
          for (let i = 0; i < 24; i++) {
            const jump = Math.random() < 0.25 ? (Math.random() * 40 - 20) : 0;
            const noise = Math.random() * 14 - 7;
            value = Math.max(0, Math.min(100, value + noise + jump));
            out.push(value);
          }
          return out;
        })(),
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


