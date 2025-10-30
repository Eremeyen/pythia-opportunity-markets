export type MarketPhase = "public" | "private" | "resolved";

export type OrderSide = "YES" | "NO";

export type Position = {
  id: string;
  marketId: string;
  marketTitle: string;
  marketLogoUrl?: string;
  phase: MarketPhase;
  side: OrderSide;
  quantity: number;
  avgEntryPrice: number;
  investedUsd: number;
  realizedProceedsUsd?: number;
  realizedAtMs?: number;
  hasPendingClaim: boolean;
  resolvedOutcome?: OrderSide;
  claimed: boolean;
};

export type ClaimAction = {
  positionId: string;
  type: "sell_proceeds" | "resolution_payout";
};


