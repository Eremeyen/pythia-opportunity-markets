import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { type Position } from "../types/portfolio";
import { getCurrentValueUsd, getNextPublicStartMs, isClaimEnabled, getClaimType } from "../config/mockPositions";
import { useCountdown } from "../hooks/useCountdown";

type Props = {
  position: Position;
  onClaim: (positionId: string) => void;
};

export default function PositionCard({ position, onClaim }: Props) {
  const [isClaiming, setIsClaiming] = useState(false);
  const currentValue = getCurrentValueUsd(position);
  const pnl = useMemo(() => {
    if (currentValue == null) return undefined;
    return currentValue - position.investedUsd;
  }, [currentValue, position.investedUsd]);

  const nextPublicStart = getNextPublicStartMs(position.marketId);
  const { remainingMs } = useCountdown(nextPublicStart ?? Date.now());
  const eta = useMemo(() => formatDuration(remainingMs), [remainingMs]);

  const claimable = isClaimEnabled(position);
  const claimType = getClaimType(position);

  useEffect(() => {
    if (position.claimed || !position.hasPendingClaim) {
      setIsClaiming(false);
    }
  }, [position.claimed, position.hasPendingClaim]);

  return (
    <div className="w-full border-4 border-black rounded-2xl p-4 bg-white flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link
          to={`/markets/${position.marketId}`}
          className="flex items-center gap-3 no-underline hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#174a8c] focus-visible:ring-offset-white rounded-md"
          aria-label={`View market ${position.marketTitle}`}
        >
          {position.marketLogoUrl ? (
            <img src={position.marketLogoUrl} alt="logo" className="w-8 h-8" />
          ) : null}
          <div>
            <div className="font-extrabold text-[#0b1f3a]">{position.marketTitle}</div>
            <div className="text-sm md:text-base font-extrabold text-[#0b1f3a] opacity-80">{chipLabel(position.phase)}</div>
          </div>
        </Link>
        {renderClaimButton()}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Stat label="Side" value={position.side} />
        <Stat
          label="Quantity"
          value={position.phase === "private" ? "Hidden" : position.quantity.toLocaleString()}
        />
        <Stat label="Invested" value={fmtUsd(position.investedUsd)} />
        {position.phase === "public" ? (
          <>
            <Stat label="Current Value" value={currentValue != null ? fmtUsd(currentValue) : "—"} />
            <Stat label="PnL" value={pnl != null ? fmtUsd(pnl) : "—"} />
          </>
        ) : position.phase === "private" ? (
          <>
            <Stat label="Next public in" value={nextPublicStart ? eta : "—"} />
            <Stat label="Current Value" value={"Hidden"} />
          </>
        ) : (
          <>
            <Stat label="Outcome" value={position.resolvedOutcome ?? "—"} />
            <Stat label="Claim Status" value={position.claimed ? "Claimed" : position.hasPendingClaim ? "Owed" : "Settled"} />
          </>
        )}
      </div>
    </div>
  );

  function renderClaimButton() {
    if (!position.hasPendingClaim && !position.claimed) return null;
    const disabled = !claimable || isClaiming;
    const label = isClaiming
      ? "Claiming…"
      : position.claimed
      ? "Claimed"
      : claimType === "resolution_payout"
      ? "Claim Payout"
      : "Claim Proceeds";
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsClaiming(true);
          onClaim(position.id);
        }}
        className={`px-4 py-2 rounded-xl border-2 font-bold ${
          disabled
            ? "bg-neutral-200 text-neutral-500 border-neutral-400 cursor-not-allowed"
            : "bg-white text-black border-black hover:bg-neutral-100"
        }`}
        aria-disabled={disabled}
        aria-busy={isClaiming}
      >
        <span className="inline-flex items-center gap-2">
          {isClaiming ? (
            <Spinner className="w-4 h-4" />
          ) : null}
          <span>{label}</span>
        </span>
      </button>
    );
  }
}

function chipLabel(phase: Position["phase"]) {
  if (phase === "public") return "Public";
  if (phase === "private") return "Private";
  return "Resolved";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-[#0b1f3a] opacity-60">{label}</span>
      <span className="text-base font-extrabold text-[#0b1f3a]">{value}</span>
    </div>
  );
}

function fmtUsd(n: number): string {
  const sign = n < 0 ? "-" : "";
  const val = Math.abs(n);
  return `${sign}$${val.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatDuration(ms: number): string {
  if (!isFinite(ms) || ms <= 0) return "0s";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${ss}s`;
  return `${ss}s`;
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="4"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}


