import { useUserAddress } from "../hooks/useUserAddress";
import { usePortfolioBalance } from "../hooks/usePortfolioBalance";
import { useCumulativePnl } from "../hooks/useCumulativePnl";
import PositionCard from "../components/PositionCard";
import { useUserPositions } from "../hooks/useUserPositions";

export default function ProfilePage() {
  const { short } = useUserAddress();
  const { balanceUsd } = usePortfolioBalance();
  const { pnlUsd } = useCumulativePnl();
  const { positions, setPositions } = useUserPositions();

  const onClaim = (id: string) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, claimed: true, hasPendingClaim: false } : p))
    );
  };

  return (
    <div className="max-w-4xl w-full mx-auto">
      {/* Top metrics: left box (address + portfolio value), right box (cumulative PnL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border-4 border-black rounded-2xl bg-white p-4 flex flex-col gap-2">
          <div className="text-xs uppercase tracking-wide text-[#0b1f3a] opacity-60">Address</div>
          <div className="text-base md:text-lg font-extrabold text-[#0b1f3a] font-mono">{short}</div>
          <div className="text-xs uppercase tracking-wide text-[#0b1f3a] opacity-60 mt-2">Portfolio Value</div>
          <div className="text-3xl md:text-4xl font-extrabold text-[#0b1f3a]">{fmtUsd(balanceUsd)}</div>
        </div>
        <div className="border-4 border-black rounded-2xl bg-white p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-[#0b1f3a] opacity-60">Cumulative PnL</div>
            <div className={`text-3xl md:text-4xl font-extrabold ${pnlUsd >= 0 ? "text-green-700" : "text-red-700"}`}>
              {fmtSignedUsd(pnlUsd)}
            </div>
          </div>
        </div>
      </div>

      {/* Unified list of positions */}
      <div className="grid grid-cols-1 gap-4">
        {positions.map((p) => (
          <PositionCard key={p.id} position={p} onClaim={onClaim} />
        ))}
      </div>
    </div>
  );
}

function fmtUsd(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function fmtSignedUsd(n: number): string {
  const sign = n >= 0 ? "" : "-";
  const v = Math.abs(n);
  return `${sign}$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}
