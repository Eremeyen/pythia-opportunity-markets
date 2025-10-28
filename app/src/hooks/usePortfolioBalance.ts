import { useMemo, useState, useEffect } from "react";
import { getPositions, getCurrentValueUsd } from "../config/mockPositions";

export function usePortfolioBalance(): {
  balanceUsd: number;
  loading: boolean;
} {
  const [loading, setLoading] = useState(true);
  const [balanceUsd, setBalanceUsd] = useState(0);

  useEffect(() => {
    // Simulate async fetch
    const id = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(id);
  }, []);

  const positions = useMemo(() => getPositions(), []);

  const computed = useMemo(() => {
    // Balance = realized proceeds (claimed + unclaimed)
    //         + value of public open positions
    //         + cost basis for private open positions (placeholder)
    let sum = 0;
    for (const p of positions) {
      if (p.realizedProceedsUsd) sum += p.realizedProceedsUsd;
      if (p.phase === "public") {
        const val = getCurrentValueUsd(p);
        if (val) sum += val;
      } else if (p.phase === "private") {
        sum += p.investedUsd;
      }
      if (p.phase === "resolved" && p.hasPendingClaim && !p.claimed) {
        // naive: assume YES pays 1, NO pays 1 to NO, etc.
        // We don't know odds; add invested as placeholder owed
        sum += p.side === "YES" ? p.quantity * 1 : 0;
      }
    }
    return sum;
  }, [positions]);

  useEffect(() => setBalanceUsd(computed), [computed]);

  return { balanceUsd, loading };
}


