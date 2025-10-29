import { useEffect } from "react";
import type { Trade } from "../config/mockTrades";

export default function TradeFeed({
  trades,
  marketId,
  sponsorMode,
  onTick,
}: {
  trades: Trade[];
  marketId: string;
  sponsorMode: boolean;
  onTick: (marketId: string) => void;
}) {
  useEffect(() => {
    if (!sponsorMode) return; // only simulate in sponsor mode
    const id = setInterval(() => onTick(marketId), 2000 + Math.random() * 1500);
    return () => clearInterval(id);
  }, [marketId, sponsorMode, onTick]);

  return (
    <div className="border-2 border-black rounded-xl overflow-hidden bg-white">
      <div className="px-3 py-2 font-bold border-b-2 border-black bg-black text-white">Trades</div>
      <div className="max-h-64 overflow-auto divide-y-2 divide-black/10">
        {trades.slice().reverse().map((t) => (
          <div key={t.id} className="px-3 py-2 text-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full border-2 ${t.side === "BUY_YES" ? "border-emerald-700 text-emerald-800" : "border-rose-700 text-rose-800"}`}>{t.side}</span>
              <span className="text-[#0b1f3a] opacity-80">{t.size} @ {t.price.toFixed(1)}%</span>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#0b1f3a] opacity-60">{new Date(t.tsMs).toLocaleTimeString()}</div>
              <div className="text-[11px] text-[#0b1f3a] opacity-80 mt-0.5">
                {`${t.trader.slice(0, 4)}…${t.trader.slice(-4)}`}
              </div>
            </div>
          </div>
        ))}
        {trades.length === 0 && (
          <div className="px-3 py-4 text-sm text-[#0b1f3a] opacity-70">No trades yet.</div>
        )}
      </div>
    </div>
  );
}


