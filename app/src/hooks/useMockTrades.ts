import { useCallback, useEffect, useMemo, useState } from "react";
import type { SponsorMarket } from "../config/mockSponsorMarkets";
import type { Trade } from "../config/mockTrades";

function randomBase58(len: number): string {
  const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += BASE58[Math.floor(Math.random() * BASE58.length)];
  }
  return out;
}

function generateNextTrade(marketId: string, prevPrice: number | null): Trade {
  const id = `${marketId}-${Math.random().toString(36).slice(2, 8)}`;
  const base = prevPrice ?? 50;
  const delta = (Math.random() - 0.5) * 3.0;
  const price = Math.max(0, Math.min(100, base + delta));
  const size = Math.floor(1 + Math.random() * 5) * 10;
  const side = Math.random() > 0.5 ? "BUY_YES" : "BUY_NO" as const;
  const trader = randomBase58(44);
  return { id, marketId, tsMs: Date.now(), side, size, price, trader };
}

export function useMockTrades(markets: SponsorMarket[]) {
  const [tradesMap, setTradesMap] = useState<Record<string, Trade[]>>({});

  // Seed initial trades for markets (once per market),
  // but skip newly created markets that have no history (priceSeries length <= 1)
  useEffect(() => {
    setTradesMap((prev) => {
      let changed = false;
      const next: Record<string, Trade[]> = { ...prev };
      const now = Date.now();
      for (const m of markets) {
        const id = m.id;
        // Skip seeding if market appears newly created (no history)
        if ((m.priceSeries && m.priceSeries.length <= 1)) {
          continue;
        }
        if (!next[id] || next[id].length === 0) {
          const count = 6 + Math.floor(Math.random() * 6); // 6..11
          const stepMs = Math.floor((45 * 60 * 1000) / Math.max(1, count));
          const seeded: Trade[] = [];
          let price = 50 + (Math.random() * 20 - 10);
          for (let i = 0; i < count; i++) {
            const delta = (Math.random() - 0.5) * 3.0;
            price = Math.max(0, Math.min(100, price + delta));
            const size = (1 + Math.floor(Math.random() * 5)) * 10;
            const side = Math.random() > 0.5 ? "BUY_YES" : "BUY_NO" as const;
            const tsMs = now - (count - i) * stepMs;
            const t: Trade = {
              id: `${id}-seed-${i}-${Math.random().toString(36).slice(2, 6)}`,
              marketId: id,
              tsMs,
              side,
              size,
              price,
              trader: randomBase58(44),
            };
            seeded.push(t);
          }
          next[id] = seeded;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [markets]);

  const getTrades = useCallback(
    (marketId: string): Trade[] => tradesMap[marketId] ?? [],
    [tradesMap]
  );

  const appendTrade = useCallback((marketId: string, trade?: Trade) => {
    setTradesMap((prev) => {
      const list = prev[marketId] ?? [];
      // If no prior trades, start from the market's current last price if available
      const market = markets.find((mk) => mk.id === marketId);
      const marketBase = market?.priceSeries && market.priceSeries.length > 0
        ? market.priceSeries[market.priceSeries.length - 1]
        : null;
      const prevPrice = list.length > 0 ? list[list.length - 1].price : marketBase;
      const t = trade ?? generateNextTrade(marketId, prevPrice);
      return { ...prev, [marketId]: [...list, t] };
    });
  }, []);

  const tradesByMarket = useMemo(() => tradesMap, [tradesMap]);

  return { tradesByMarket, getTrades, appendTrade };
}


