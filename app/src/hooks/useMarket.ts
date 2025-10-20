import { useMemo } from "react";
import type { Market } from "../types/market";

export function useMarket(id?: string): { market?: Market; loading: boolean; error?: string } {
  const market = useMemo<Market | undefined>(() => {
    if (!id) return undefined;
    const idx = parseInt(id.replace(/\D/g, "")) || 0;
    const isHidden = idx % 2 === 0;
    return {
      id,
      title: isHidden ? "Will YC fund Orchard AI in the next 6 months?" : "Will a16z fund AtlasDB this quarter?",
      description: "First-pass mock market details for development.",
      isPriceHidden: isHidden,
      opportunityEndMs: Date.now() + 72 * 3600_000,
      resultsEndMs: Date.now() + 30 * 24 * 3600_000,
      priceSeries: [...Array(96)].map((_, i) => 100 + Math.sin(i / 6) * 3 + i * 0.2),
      attentionScore: 0.66,
      sponsor: { id: "s-1", name: isHidden ? "YC" : "a16z", url: "https://example-sponsor.org" },
      company: {
        id: "c-1",
        name: isHidden ? "Orchard AI" : "AtlasDB",
        logoUrl: isHidden ? "/logos/apple.svg" : "/logos/google.svg",
        website: "https://example.com",
        summary: "AI infra startup with strong early traction.",
      },
    };
  }, [id]);

  return { market, loading: false, error: undefined };
}


