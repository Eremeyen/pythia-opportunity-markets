import { MOCK_MARKETS, type MockMarketPreview } from "./mockMarkets";
import { type Position } from "../types/portfolio";

function findMarket(marketId: string): MockMarketPreview | undefined {
  return MOCK_MARKETS.find((m) => m.id === marketId);
}

export const MOCK_POSITIONS: Position[] = [
  {
    id: "p-1",
    marketId: "m-1",
    marketTitle: "Will Y Combinator fund Orchard AI in the next 6 months?",
    marketLogoUrl: "/logos/apple.svg",
    phase: "public",
    side: "YES",
    quantity: 120,
    avgEntryPrice: 0.9,
    investedUsd: 108,
    hasPendingClaim: false,
    claimed: false,
  },
  {
    id: "p-2",
    marketId: "m-2",
    marketTitle: "Will a16z fund AtlasDB this quarter?",
    marketLogoUrl: "/logos/google.svg",
    phase: "private",
    side: "YES",
    quantity: 200,
    avgEntryPrice: 0.75,
    investedUsd: 150,
    // sold in private window; proceeds pending until public
    realizedProceedsUsd: 165,
    realizedAtMs: Date.now() - 3600_000,
    hasPendingClaim: true,
    claimed: false,
  },
  {
    id: "p-3",
    marketId: "m-3",
    marketTitle: "Will Sequoia fund RiverCart by Q2?",
    marketLogoUrl: "/logos/amazon.svg",
    phase: "public",
    side: "YES",
    quantity: 0,
    avgEntryPrice: 0.6,
    investedUsd: 120,
    // fully sold during public; claimable now
    realizedProceedsUsd: 135,
    realizedAtMs: Date.now() - 2 * 3600_000,
    hasPendingClaim: true,
    claimed: false,
  },
  {
    id: "p-4",
    marketId: "m-5",
    marketTitle: "Will Greylock fund TensorMesh this cycle?",
    marketLogoUrl: "/logos/nvidia.svg",
    phase: "resolved",
    side: "YES",
    quantity: 300,
    avgEntryPrice: 0.5,
    investedUsd: 150,
    resolvedOutcome: "YES",
    hasPendingClaim: true,
    claimed: false,
  },
  {
    id: "p-5",
    marketId: "m-4",
    marketTitle: "Will Accel fund CursorForge by Q1?",
    marketLogoUrl: "/logos/microsoft.svg",
    phase: "private",
    side: "NO",
    quantity: 100,
    avgEntryPrice: 0.4,
    investedUsd: 40,
    hasPendingClaim: false,
    claimed: false,
  },
];

export function getPositions(): Position[] {
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("positions") : null;
    if (raw) return JSON.parse(raw) as Position[];
  } catch {}
  return JSON.parse(JSON.stringify(MOCK_POSITIONS));
}

export function savePositions(positions: Position[]): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("positions", JSON.stringify(positions));
    }
  } catch {}
}

export function applyResolutionToPositions(marketId: string, outcome: "YES" | "NO"): void {
  const current = getPositions();
  const updated = current.map((p) => {
    if (p.marketId !== marketId) return p;
    return {
      ...p,
      phase: "resolved",
      resolvedOutcome: outcome,
      hasPendingClaim: p.side === outcome ? true : false,
    } as Position;
  });
  savePositions(updated);
}

export function getMarketPhaseById(marketId: string): "public" | "private" | undefined {
  const m = findMarket(marketId);
  return m?.visibility;
}

export function getNextPublicStartMs(marketId: string): number | undefined {
  const m = findMarket(marketId);
  return m?.nextOpportunityStartMs;
}

export function getCurrentPrice(marketId: string): number | undefined {
  const m = findMarket(marketId);
  if (!m?.priceSeries || m.priceSeries.length === 0) return undefined;
  return m.priceSeries[m.priceSeries.length - 1] / 100; // interpret cents->dollars
}

export function getCurrentValueUsd(position: Position): number | undefined {
  if (position.phase !== "public") return undefined;
  const price = getCurrentPrice(position.marketId);
  if (price == null) return undefined;
  return position.quantity * price;
}

export function isClaimEnabled(position: Position): boolean {
  // Public window: sold positions or resolved outcomes owed can claim now
  if (position.phase === "public") {
    return !!position.hasPendingClaim && !position.claimed;
  }
  // Private window: cannot claim to avoid leakage
  if (position.phase === "private") {
    return false;
  }
  // Resolved: enable if owed and not claimed
  if (position.phase === "resolved") {
    return !!position.hasPendingClaim && !position.claimed;
  }
  return false;
}

export function getClaimType(position: Position): "sell_proceeds" | "resolution_payout" | undefined {
  if (!position.hasPendingClaim || position.claimed) return undefined;
  return position.phase === "resolved" ? "resolution_payout" : "sell_proceeds";
}


