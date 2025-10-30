// Mock markets for UI. Temporary dev data until backend integration.
// Notes:
// - visibility: indicates whether a market is public or private for simple filtering.
// - In production, markets should be fetched and cached in memory; consider a
//   lightweight store or SWR/react-query for syncing and caching.

export type MockMarketPreview = {
  id: string;
  logoUrl: string;
  title: string;
  description: string;
  isPriceHidden: boolean;
  opportunityStartMs: number;
  opportunityEndMs: number;
  resultsEndMs?: number;
  nextOpportunityStartMs?: number;
  attentionScore?: number;
  priceSeries?: number[];
  visibility: "public" | "private";
};

export const MOCK_MARKETS: MockMarketPreview[] = [
  {
    id: "m-1",
    logoUrl: "/logos/apple.svg",
    title: "Will Y Combinator fund Orchard AI in the next 6 months?",
    description: "",
    isPriceHidden: true,
    opportunityStartMs: Date.now() - 60_000,
    opportunityEndMs: Date.now() + 72 * 3600_000,
    resultsEndMs: Date.now() + 30 * 24 * 3600_000,
    nextOpportunityStartMs: Date.now() + 45 * 24 * 3600_000,
    attentionScore: 0.7,
    priceSeries: [...Array(24)].map(
      (_, idx) => 100 + Math.sin(idx / 3) * 2 + idx * 0.3
    ),
    visibility: "public",
  },
  {
    id: "m-2",
    logoUrl: "/logos/google.svg",
    title: "Will a16z fund AtlasDB this quarter?",
    description: "",
    isPriceHidden: false,
    opportunityStartMs: Date.now() - 60_000,
    opportunityEndMs: Date.now() + 12 * 3600_000,
    resultsEndMs: Date.now() + 30 * 24 * 3600_000,
    nextOpportunityStartMs: Date.now() + 45 * 24 * 3600_000,
    attentionScore: 0.5,
    priceSeries: [...Array(24)].map(
      (_, idx) => 100 + Math.sin(idx / 3) * 2 + idx * 0.3
    ),
    visibility: "private",
  },
  {
    id: "m-3",
    logoUrl: "/logos/amazon.svg",
    title: "Will Sequoia fund RiverCart by Q2?",
    description: "",
    isPriceHidden: true,
    opportunityStartMs: Date.now() - 60_000,
    opportunityEndMs: Date.now() + 72 * 3600_000,
    resultsEndMs: Date.now() + 30 * 24 * 3600_000,
    nextOpportunityStartMs: Date.now() + 45 * 24 * 3600_000,
    attentionScore: 0.4,
    priceSeries: [...Array(24)].map(
      (_, idx) => 100 + Math.sin(idx / 3) * 2 + idx * 0.3
    ),
    visibility: "public",
  },
  {
    id: "m-4",
    logoUrl: "/logos/microsoft.svg",
    title: "Will Accel fund CursorForge by Q1?",
    description: "",
    isPriceHidden: false,
    opportunityStartMs: Date.now() - 60_000,
    opportunityEndMs: Date.now() + 12 * 3600_000,
    resultsEndMs: Date.now() + 30 * 24 * 3600_000,
    nextOpportunityStartMs: Date.now() + 45 * 24 * 3600_000,
    attentionScore: 0.55,
    priceSeries: [...Array(24)].map(
      (_, idx) => 100 + Math.sin(idx / 3) * 2 + idx * 0.3
    ),
    visibility: "private",
  },
  {
    id: "m-5",
    logoUrl: "/logos/nvidia.svg",
    title: "Will Greylock fund TensorMesh this cycle?",
    description: "",
    isPriceHidden: true,
    opportunityStartMs: Date.now() - 60_000,
    opportunityEndMs: Date.now() + 72 * 3600_000,
    resultsEndMs: Date.now() + 30 * 24 * 3600_000,
    nextOpportunityStartMs: Date.now() + 45 * 24 * 3600_000,
    attentionScore: 0.66,
    priceSeries: [...Array(24)].map(
      (_, idx) => 100 + Math.sin(idx / 3) * 2 + idx * 0.3
    ),
    visibility: "public",
  },
  {
    id: "m-6",
    logoUrl: "/logos/google.svg",
    title: "Will Founders Fund back LoomStack by June?",
    description: "",
    isPriceHidden: false,
    opportunityStartMs: Date.now() - 60_000,
    opportunityEndMs: Date.now() + 12 * 3600_000,
    resultsEndMs: Date.now() + 30 * 24 * 3600_000,
    nextOpportunityStartMs: Date.now() + 45 * 24 * 3600_000,
    attentionScore: 0.35,
    priceSeries: [...Array(24)].map(
      (_, idx) => 100 + Math.sin(idx / 3) * 2 + idx * 0.3
    ),
    visibility: "private",
  },
];

export function getMarketsFiltered(
  scope: "trending" | "public" | "private"
): MockMarketPreview[] {
  if (scope === "public")
    return MOCK_MARKETS.filter((m) => m.visibility === "public");
  if (scope === "private")
    return MOCK_MARKETS.filter((m) => m.visibility === "private");
  return MOCK_MARKETS;
}
