import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import Sparkline from "../components/Sparkline";
import { useMarket } from "../hooks/useMarket";
import { useUserPositions } from "../hooks/useUserPositions";
import type { Position } from "../types/portfolio";
import { useMarketTiming } from "../hooks/useMarketTiming";
import { getCountdownSegments } from "../utils/time";

export default function MarketDetails() {
  const { id } = useParams<{ id: string }>();
  const { market } = useMarket(id);
  const [amount, setAmount] = useState<string>("");
  const { getPositionByMarketId } = useUserPositions();

  // LOADING STATE
  // IMPROVE LOADING STATE
  if (!market) {
    return (
      <div className="max-w-3xl">
        <div className="text-[#0b1f3a] font-bold">Loading market…</div>
      </div>
    );
  }

  // Estimated end date for display
  const estimatedEndMs = market.resultsEndMs ?? market.opportunityEndMs;
  const estimatedDate = new Date(estimatedEndMs).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // TODO: add validation/test coverage once backend integration lands.

  const timing = useMarketTiming({
    opportunityEndMs: market.opportunityEndMs,
    resultsEndMs: market.resultsEndMs,
    nextOpportunityStartMs: market.nextOpportunityStartMs,
    isPriceHidden: market.isPriceHidden,
  });

  const isPrivateWindow = timing.inOpportunityWindow;
  const countdownSegments = useMemo(
    () => getCountdownSegments(timing.opportunity.remainingMs),
    [timing.opportunity.remainingMs]
  );

  const position = getPositionByMarketId(market.id);
  const currentProbability = useMemo(() => {
    if (!market.priceSeries || market.priceSeries.length === 0) return undefined;
    const last = market.priceSeries[market.priceSeries.length - 1];
    // TODO: replace with canonical pricing feed once backend surfaces it.
    return Math.max(0, Math.min(100, last));
  }, [market.priceSeries]);

  const chartTimestamps = useMemo(() => {
    const len = market.priceSeries?.length ?? 0;
    if (len === 0) return [] as number[];
    const end = Date.now();
    const start = end - (len - 1) * 3600_000; // hourly points
    return Array.from({ length: len }, (_, i) => start + i * 3600_000);
  }, [market.priceSeries]);

  return (
    <div className="w-full">
      {/* Slightly-extended wrapper in public window with a bit more gutter */}
      <div className={`${isPrivateWindow ? "" : "-mx-0.5 md:-mx-1"} grid grid-cols-1 md:grid-cols-[1fr_420px] gap-8 items-start`}>
        <div className="space-y-8">
          <header className="flex gap-4 items-start">
            {market.company.logoUrl && (
              <img
                src={market.company.logoUrl}
                alt="Company logo"
                className="w-12 h-12 md:w-16 md:h-16"
              />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl md:text-3xl font-extrabold text-[#0b1f3a]">
                {market.title}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs md:text-sm text-[#0b1f3a] opacity-70">
                <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-bold">{estimatedDate}</span>
              </div>
              {!isPrivateWindow && (
                <div className="mt-3 -ml-16 md:-ml-20">
                  <div className="text-xs uppercase tracking-wide text-[#0b1f3a] opacity-60">
                    Predicted
                  </div>
                  <div className="text-3xl md:text-5xl font-extrabold text-[#0b1f3a] tabular-nums">
                    {currentProbability != null ? `${currentProbability.toFixed(1)}%` : "--"}
                  </div>
                </div>
              )}
              
            </div>
          </header>

          <section className={isPrivateWindow ? "py-8" : ""}>
            {isPrivateWindow ? (
              <div className="flex flex-col items-center gap-4">
                <div className="text-sm uppercase tracking-wide text-[#0b1f3a] opacity-70">
                  Opportunity window ends in
                </div>
                <div className="flex items-center justify-center gap-4">
                  {countdownSegments.map((segment) => (
                    <div
                      key={segment.label}
                      className="min-w-[96px] rounded-2xl border-4 border-black bg-white px-5 py-4 text-center shadow-[4px_4px_0_0_rgba(11,31,58,0.15)]"
                    >
                      <div className="text-3xl md:text-4xl font-extrabold text-[#0b1f3a] tabular-nums">
                        {segment.value}
                      </div>
                      <div className="text-xs uppercase tracking-wide text-[#0b1f3a] opacity-70 mt-2">
                        {segment.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <Sparkline
                values={market.priceSeries ?? []}
                height={320}
                stroke="#000"
                className="block w-full"
                showAxes
                showTooltip
                showCurrentRefLine
                yStartAtZero
                timestamps={chartTimestamps}
              />
            )}
            <div className={`${isPrivateWindow ? "mt-4" : "mt-2"} border-4 border-black rounded-2xl p-4 bg-white`}>
              <div className="text-sm font-extrabold text-[#0b1f3a] uppercase tracking-wide">
                Resolution criteria
              </div>
              <p className="mt-2 text-sm md:text-base text-[#0b1f3a] opacity-80">
                {market.resolutionCriteria}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8">
            <section>
              <h4 className="text-lg md:text-xl font-extrabold text-[#0b1f3a]">
                Company
              </h4>
              {market.company.summary && (
                <p className="mt-2 text-sm md:text-base text-[#0b1f3a]">
                  {market.company.summary}
                </p>
              )}
              {market.company.website && (
                <a
                  href={market.company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block underline text-sm md:text-base"
                >
                  Website
                </a>
              )}
              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:text-base text-[#0b1f3a]">
                {market.company.hq && (
                  <div className="flex items-baseline justify-between">
                    <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                      Based in
                    </dt>
                    <dd className="font-extrabold tabular-nums">{market.company.hq}</dd>
                  </div>
                )}
                {(market.company.founder || market.company.founderBackground) && (
                  <div className="flex items-baseline justify-between">
                    <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                      Founder
                    </dt>
                    <dd className="font-extrabold text-right">
                      <span>{market.company.founder ?? "—"}</span>
                      {market.company.founderBackground && (
                        <span className="block font-normal opacity-80 text-xs md:text-sm">
                          {market.company.founderBackground}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                {market.company.sectors && market.company.sectors.length > 0 && (
                  <div className="flex items-baseline justify-between">
                    <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                      Sectors
                    </dt>
                    <dd className="font-extrabold text-right">
                      {market.company.sectors.join(", ")}
                    </dd>
                  </div>
                )}
                {(market.company.foundedYear != null) && (
                  <div className="flex items-baseline justify-between">
                    <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                      Founded
                    </dt>
                    <dd className="font-extrabold tabular-nums">{market.company.foundedYear}</dd>
                  </div>
                )}
                {(market.company.totalRaisedUsd != null) && (
                  <div className="flex items-baseline justify-between">
                    <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                      Raised
                    </dt>
                    <dd className="font-extrabold tabular-nums">{formatUsd(market.company.totalRaisedUsd)}</dd>
                  </div>
                )}
                {market.company.stage && (
                  <div className="flex items-baseline justify-between">
                    <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                      Stage
                    </dt>
                    <dd className="font-extrabold">{market.company.stage}</dd>
                  </div>
                )}
                {(market.company.employees != null) && (
                  <div className="flex items-baseline justify-between">
                    <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                      Employees
                    </dt>
                    <dd className="font-extrabold tabular-nums">{market.company.employees}</dd>
                  </div>
                )}
                {market.company.notableInvestors && market.company.notableInvestors.length > 0 && (
                  <div className="flex items-baseline justify-between">
                    <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                      Investors
                    </dt>
                    <dd className="font-extrabold text-right">
                      {market.company.notableInvestors.join(", ")}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <aside className="border-4 border-black rounded-2xl p-5 bg-white">
            <h3 className="text-xl md:text-2xl font-extrabold text-[#0b1f3a]">
              Trade
            </h3>
            <label
              className="block mt-4 text-sm md:text-base font-bold text-[#0b1f3a]"
              htmlFor="amount"
            >
              Amount (SOL)
            </label>
            <input
              id="amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-2 w-full border-2 border-black rounded-xl px-4 py-3 text-base md:text-lg"
            />
            <div className="mt-4 grid grid-cols-2 gap-4">
              <button className="px-5 py-3 rounded-xl border-2 border-black bg-green-500 text-white font-extrabold text-base md:text-lg">
                Buy YES
              </button>
              <button className="px-5 py-3 rounded-xl border-2 border-black bg-red-500 text-white font-extrabold text-base md:text-lg">
                Buy NO
              </button>
            </div>
            <p className="mt-3 text-xs md:text-sm text-[#0b1f3a] opacity-70">
              Trading is mocked in v1.
            </p>
          </aside>
          <PositionSummary
            position={position}
            isPrivateWindow={isPrivateWindow}
            currentProbability={currentProbability}
          />
          {isPrivateWindow && (
            <div className="h-10 md:h-16" />
          )}
          <section className="border-4 border-black rounded-2xl bg-white p-5">
            <div className="flex items-start gap-4">
              {market.sponsor.logoUrl ? (
                <img
                  src={market.sponsor.logoUrl}
                  alt="Sponsor logo"
                  className="w-12 h-12 rounded-full border-2 border-black"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-neutral-200 border-2 border-black" />)
              }
              <div className="min-w-0 flex-1">
                <div className="text-sm font-extrabold text-[#0b1f3a] uppercase tracking-wide">
                  Sponsor
                </div>
                <div className="mt-1 font-extrabold text-[#0b1f3a] text-base md:text-lg">
                  {market.sponsor.name}
                </div>
                {market.sponsor.url && (
                  <a
                    href={market.sponsor.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs md:text-sm underline text-[#0b1f3a]"
                  >
                    Sponsor site
                  </a>
                )}
              </div>
            </div>
            {market.sponsor.description && (
              <p className="mt-3 text-sm md:text-base text-[#0b1f3a] opacity-80">
                {market.sponsor.description}
              </p>
            )}
            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:text-base text-[#0b1f3a]">
              {market.sponsor.focusSectors && market.sponsor.focusSectors.length > 0 && (
                <div className="flex items-baseline justify-between">
                  <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                    Focus
                  </dt>
                  <dd className="font-extrabold text-right">
                    {market.sponsor.focusSectors.join(", ")}
                  </dd>
                </div>
              )}
              {market.sponsor.stageFocus && market.sponsor.stageFocus.length > 0 && (
                <div className="flex items-baseline justify-between">
                  <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                    Stages
                  </dt>
                  <dd className="font-extrabold text-right">
                    {market.sponsor.stageFocus.join(", ")}
                  </dd>
                </div>
              )}
              {market.sponsor.hq && (
                <div className="flex items-baseline justify-between">
                  <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                    HQ
                  </dt>
                  <dd className="font-extrabold tabular-nums">{market.sponsor.hq}</dd>
                </div>
              )}
              {market.sponsor.checkSizeRange && (
                <div className="flex items-baseline justify-between">
                  <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
                    Check size
                  </dt>
                  <dd className="font-extrabold">{market.sponsor.checkSizeRange}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

function PositionSummary({
  position,
  isPrivateWindow,
  currentProbability,
}: {
  position?: Position;
  isPrivateWindow: boolean;
  currentProbability?: number;
}) {
  const invested = position ? formatUsd(position.investedUsd) : "--";
  const side = !isPrivateWindow && position ? position.side : "--";
  const quantity = !isPrivateWindow && position ? position.quantity.toLocaleString() : "--";
  const avgEntry = !isPrivateWindow && position ? position.avgEntryPrice.toFixed(2) : "--";

  let estimatedValue = "--";
  if (!isPrivateWindow && position && currentProbability != null) {
    const value = (position.quantity * currentProbability) / 100;
    estimatedValue = formatUsd(value);
  }

  return (
    <section className="border-4 border-black rounded-2xl bg-white p-5">
      <div className="text-sm font-extrabold text-[#0b1f3a] uppercase tracking-wide">
        Your position
      </div>
      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:text-base text-[#0b1f3a]">
        <div className="flex items-baseline justify-between">
          <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
            Invested
          </dt>
          <dd className="font-extrabold tabular-nums">{invested}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
            Side
          </dt>
          <dd className="font-extrabold tabular-nums">{side}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
            Quantity
          </dt>
          <dd className="font-extrabold tabular-nums">{quantity}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
            Avg entry
          </dt>
          <dd className="font-extrabold tabular-nums">{avgEntry}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="font-bold opacity-70 uppercase tracking-wide text-xs md:text-sm">
            Est. value
          </dt>
          <dd className="font-extrabold tabular-nums">{estimatedValue}</dd>
        </div>
      </dl>
      {position == null && (
        <div className="mt-3 text-xs text-[#0b1f3a] opacity-60">
          You have not opened a position in this market yet.
        </div>
      )}
      {isPrivateWindow && position != null && (
        <div className="mt-3 text-xs text-[#0b1f3a] opacity-60">
          Position details unlock when the market exits the opportunity window.
        </div>
      )}
    </section>
  );
}

function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7 2v3m10-3v3M5 9h14M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="#0b1f3a"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
