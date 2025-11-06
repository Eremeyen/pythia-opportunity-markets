import { useCallback, useEffect, useMemo, useState } from "react";
import type { Position } from "../types/portfolio";
import { getPositions, savePositions } from "../config/mockPositions";

type UseUserPositionsResult = {
  positions: Position[];
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
  refresh: () => void;
  getPositionByMarketId: (marketId?: string) => Position | undefined;
};

/**
 * Temporary hook that emulates fetching the signed-in user's positions.
 * For now we simply hydrate from mock data so UI work can proceed while
 * waiting on real backend events to keep the portfolio in sync.
 */
export function useUserPositions(): UseUserPositionsResult {
  const [positions, setPositions] = useState<Position[]>(() => getPositions());

  const refresh = useCallback(() => {
    // TODO: replace with backend subscription once trading API is wired up.
    setPositions(getPositions());
  }, []);

  const getPositionByMarketId = useCallback(
    (marketId?: string) =>
      marketId ? positions.find((p) => p.marketId === marketId) : undefined,
    [positions]
  );

  useEffect(() => {
    savePositions(positions);
  }, [positions]);

  return useMemo(
    () => ({ positions, setPositions, refresh, getPositionByMarketId }),
    [positions, refresh, getPositionByMarketId]
  );
}


