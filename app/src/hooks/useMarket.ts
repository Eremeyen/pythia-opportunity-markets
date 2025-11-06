import { useMemo } from "react";
import type { Market } from "../types/market";
import { MOCK_SPONSOR_MARKETS } from "../config/mockSponsorMarkets";
import { MOCK_MARKETS, type MockMarketPreview } from "../config/mockMarkets";

export function useMarket(id?: string): {
  market?: Market;
  loading: boolean;
  error?: string;
} {
  const market = useMemo<Market | undefined>(() => {
    if (!id) return undefined;
    const direct = MOCK_SPONSOR_MARKETS.find((m) => m.id === id) as Market | undefined;
    if (direct) return direct;
    const generic = MOCK_MARKETS.find((m) => m.id === id);
    return generic ? adaptGenericToMarket(generic) : undefined;
  }, [id]);

  return { market, loading: false, error: undefined };
}

function adaptGenericToMarket(m: MockMarketPreview): Market {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    isPriceHidden: m.isPriceHidden,
    opportunityEndMs: m.opportunityEndMs,
    resultsEndMs: m.resultsEndMs,
    priceSeries: m.priceSeries ?? [],
    attentionScore: m.attentionScore,
    sponsor: {
      id: "sp-demo",
      name: "Demo Sponsor",
    },
    company: {
      id: `c-${m.id}`,
      name: m.title,
      logoUrl: m.logoUrl,
    },
    resolutionCriteria:
      "Resolve to YES if the sponsor confirms a funding decision within the resolution window.",
    nextOpportunityStartMs: m.nextOpportunityStartMs,
  };
}
