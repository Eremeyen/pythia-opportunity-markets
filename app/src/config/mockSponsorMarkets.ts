import type { Market } from "../types/market";
import { MOCK_SPONSORS } from "./mockSponsors";

export type Resolution = "YES" | "NO" | null;

export type SponsorMarket = Market & {
  liquidity: number; // in SOL (mock)
  resolutionCriteria: string;
  isPrivate: boolean; // mirrors isPriceHidden but explicit for UI filters
  status: "open" | "resolved";
  resolution: Resolution;
  nextOpportunityStartMs?: number;
  nextOpportunityEndMs?: number;
};

export const MOCK_SPONSOR_MARKETS: SponsorMarket[] = (() => {
  const seeded: SponsorMarket[] = [];
  for (const sp of MOCK_SPONSORS) {
    for (const m of sp.sampleMarkets) {
      seeded.push({
        ...m,
        liquidity: Math.round((50 + Math.random() * 200) * 100) / 100,
        resolutionCriteria:
          "Sponsor will resolve to YES if funding decision is affirmative within the window.",
        isPrivate: !!m.isPriceHidden,
        status: "open",
        resolution: null,
      });
    }
  }
  // Ensure at least one public-window market for testing:
  // Pick the first non-private, set opportunityEndMs in the past and resultsEndMs in the future
  const idx = seeded.findIndex((mk) => !mk.isPrivate);
  if (idx >= 0) {
    const now = Date.now();
    const mk = seeded[idx];
    seeded[idx] = {
      ...mk,
      opportunityEndMs: now - 2 * 3600_000, // 2h ago
      resultsEndMs: now + 7 * 24 * 3600_000, // resolves in 7d
      nextOpportunityStartMs: now + 2 * 24 * 3600_000, // in 2d
      nextOpportunityEndMs: now + 3 * 24 * 3600_000, // lasts 1d
    } as SponsorMarket;
  }

  // Lightly expand dataset to ensure minimum counts for public/private
  const ensureMinCounts = (publicMin = 12, privateMin = 12) => {
    const pubs = seeded.filter((m) => !m.isPrivate);
    const privs = seeded.filter((m) => m.isPrivate);

    const makeClone = (m: SponsorMarket, i: number): SponsorMarket => ({
      ...m,
      id: `${m.id}-alt-${i}`,
      title: `${m.title} — ${String.fromCharCode(65 + (i % 26))}`,
      priceSeries: (m.priceSeries ?? []).map((v) =>
        Math.max(0, v + (Math.random() - 0.5) * 2)
      ),
      attentionScore: Math.max(
        1,
        Math.min(
          100,
          (m.attentionScore ?? 50) + Math.round((Math.random() - 0.5) * 10)
        )
      ),
    });

    if (pubs.length > 0) {
      for (let i = 0; pubs.length < publicMin; i++) {
        const clone = makeClone(pubs[i % pubs.length], i);
        pubs.push(clone);
        seeded.push(clone);
      }
    }

    if (privs.length > 0) {
      for (let i = 0; privs.length < privateMin; i++) {
        const clone = makeClone(privs[i % privs.length], i);
        privs.push(clone);
        seeded.push(clone);
      }
    }
  };

  ensureMinCounts();
  return seeded;
})();

export function getSponsorMarketsFiltered(
  scope: "trending" | "public" | "private"
): SponsorMarket[] {
  if (scope === "public") return MOCK_SPONSOR_MARKETS.filter((m) => !m.isPrivate);
  if (scope === "private") return MOCK_SPONSOR_MARKETS.filter((m) => m.isPrivate);
  return MOCK_SPONSOR_MARKETS;
}


