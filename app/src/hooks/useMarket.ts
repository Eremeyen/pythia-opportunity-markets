import { useMemo } from "react";
import type { Market } from "../types/market";
import { MOCK_SPONSOR_MARKETS } from "../config/mockSponsorMarkets";

export function useMarket(id?: string): {
  market?: Market;
  loading: boolean;
  error?: string;
} {
  const market = useMemo<Market | undefined>(() => {
    if (!id) return undefined;
    return MOCK_SPONSOR_MARKETS.find((m) => m.id === id);
  }, [id]);

  return { market, loading: false, error: undefined };
}
