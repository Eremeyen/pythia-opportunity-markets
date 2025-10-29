import Sparkline from "./Sparkline";
import type { SponsorMarket } from "../config/mockSponsorMarkets";
import { useCountdown } from "../hooks/useCountdown";
import { formatDurationShort } from "../utils/time";

export default function SponsorMarketDetails({
  market,
  onResolveClick,
  sponsorMode,
}: {
  market: SponsorMarket;
  onResolveClick: () => void;
  sponsorMode: boolean;
}) {
  const values = market.priceSeries ?? [...Array(24)].map((_, i) => 100 + Math.sin(i / 3) * 2 + i * 0.2);

  const now = Date.now();
  const isResolved = market.status === "resolved";
  const inOpportunity = !isResolved && now < market.opportunityEndMs;
  const inPublic = !isResolved && !inOpportunity && (market.resultsEndMs ? now < market.resultsEndMs : true);
  const windowLabel = isResolved ? `Resolved ${market.resolution ?? ""}` : inOpportunity ? "Opportunity window" : "Public window";
  const targetMs = inOpportunity ? market.opportunityEndMs : market.resultsEndMs ?? market.opportunityEndMs;
  const { remainingMs } = useCountdown(targetMs);
  const untilNext = isResolved ? "—" : formatDurationShort(remainingMs);
  const nextOppTarget = market.nextOpportunityStartMs ?? market.opportunityEndMs;
  const { remainingMs: nextOppMs } = useCountdown(nextOppTarget);
  const showNextOpp = inPublic && !!market.nextOpportunityStartMs && now < (market.nextOpportunityStartMs as number);
  const nextOppCountdown = showNextOpp ? formatDurationShort(nextOppMs) : "—";

  const lastPrice = values[values.length - 1] ?? 0;
  const probability = Math.max(0, Math.min(100, lastPrice));

  return (
    <div className="space-y-4">
      <div className="border-2 border-black rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 border-b-2 border-black bg-black text-white font-bold">Market</div>
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xl font-extrabold text-[#0b1f3a]">{market.title}</div>
              <div className="text-sm text-[#0b1f3a] opacity-80 mt-1">{market.description}</div>
              <div className="mt-2 text-xs text-[#0b1f3a] opacity-70">
                Liquidity {market.liquidity.toLocaleString(undefined, { maximumFractionDigits: 2 })} SOL · {market.isPrivate ? "Private" : "Public"}
              </div>
            </div>
            <Sparkline values={values} width={260} height={80} className="shrink-0" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Probability" value={`${probability.toFixed(1)}%`} />
            <Kpi label="Window" value={windowLabel} />
            <Kpi label={inOpportunity ? "Public starts in" : isResolved ? "—" : "Resolves in"} value={untilNext} />
            <Kpi label={showNextOpp ? "Next opportunity in" : "Resolution date"} value={showNextOpp ? nextOppCountdown : (market.resultsEndMs ? new Date(market.resultsEndMs).toLocaleDateString() : "—")} />
          </div>
          <div>
            <div className="text-sm font-bold">Resolution criteria</div>
            <div className="text-sm text-[#0b1f3a] opacity-80 mt-1">{market.resolutionCriteria}</div>
          </div>
          {market.status === "open" && sponsorMode && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onResolveClick}
                className="px-5 py-2 rounded-xl bg-white text-black font-extrabold border-4 border-black hover:bg-neutral-100"
              >
                Resolve…
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border-2 border-black/10 bg-white">
      <div className="text-[11px] uppercase tracking-wide text-[#0b1f3a] opacity-60">{label}</div>
      <div className="text-base font-bold text-[#0b1f3a] mt-1">{value}</div>
    </div>
  );
}


