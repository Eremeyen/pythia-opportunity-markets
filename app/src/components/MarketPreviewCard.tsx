import AttentionIndicator from "./AttentionIndicator";
import Sparkline from "./Sparkline";
import { formatDurationShort } from "../utils/time";
import { useCountdown, useNow } from "../hooks/useCountdown";
import { Link } from "react-router-dom";

export type MarketPreviewCardProps = {
    // MARKET ID MAY NEED TO BE IN DIFFERENT FORMAT
    // THE TYPE OF THIS PROP MAY HAVE TO CHANGE
  id: string;
  logoUrl: string;
  title: string;
  description: string;
  opportunityStartMs: number;
  opportunityEndMs: number;
  resultsEndMs?: number;
  nextOpportunityStartMs?: number;
  isPriceHidden: boolean;
  attentionScore?: number;
  priceSeries?: number[];
  className?: string;
};

function Badge({ label, value, ariaLabel }: { label: string; value: string; ariaLabel: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 border-2 border-black bg-white rounded-full px-2 py-0.5 text-xs font-bold text-[#0b1f3a]"
      aria-label={ariaLabel}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </span>
  );
}

export default function MarketPreviewCard(props: MarketPreviewCardProps) {
  const {
    logoUrl,
    title,
    description,
    opportunityEndMs,
    resultsEndMs,
    nextOpportunityStartMs,
    isPriceHidden,
    attentionScore,
    priceSeries,
    className,
  } = props;

  const { remainingMs: oppRemainMs, isPast: oppPast } = useCountdown(opportunityEndMs);
  const now = useNow();

  const badgeA = oppPast
    ? { label: "Opportunity ended", value: formatDurationShort(now - opportunityEndMs) + " ago" }
    : { label: "Opportunity ends in", value: formatDurationShort(oppRemainMs) };

  let badgeB: { label: string; value: string } | null = null;
  if (resultsEndMs) {
    const { remainingMs, isPast } = useCountdown(resultsEndMs);
    badgeB = isPast
      ? { label: "Results ended", value: formatDurationShort(now - resultsEndMs) + " ago" }
      : { label: "Results end in", value: formatDurationShort(remainingMs) };
  } else if (nextOpportunityStartMs) {
    const { remainingMs, isPast } = useCountdown(nextOpportunityStartMs);
    badgeB = isPast
      ? { label: "Next window started", value: formatDurationShort(now - nextOpportunityStartMs) + " ago" }
      : { label: "Next window in", value: formatDurationShort(remainingMs) };
  }

  return (
    <Link
      to={`/markets/${props.id}`}
      className={
        "block group p-[3px] rounded-2xl bg-gradient-to-r from-[#0b1f3a] via-[#174a8c] to-[#6b5b95] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#174a8c] focus-visible:ring-offset-white " +
        (className ?? "")
      }
      aria-label={`Open market ${title}`}
    >
      <div className="h-full bg-white rounded-[calc(1rem-3px)] border-4 border-black p-4 md:p-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md flex flex-col">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 overflow-hidden">
            <img src={logoUrl} alt="Market logo" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg md:text-xl font-extrabold leading-tight text-[#0b1f3a] break-words">{title}</h3>
            <p className="mt-1 text-sm text-[#0b1f3a] line-clamp-3">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-4 h-24 w-full flex items-center">
          {isPriceHidden ? (
            <div className="w-full h-full flex items-center justify-between gap-3">
              <AttentionIndicator score={attentionScore} />
              <span className="text-xs font-bold text-[#0b1f3a]">Price hidden during opportunity</span>
            </div>
          ) : (
            <Sparkline
              values={priceSeries ?? []}
              width={480}
              height={96}
              stroke="#0b1f3a"
              fill="#0b1f3a10"
              className="w-full h-24"
            />
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge label={badgeA.label} value={badgeA.value} ariaLabel={`${badgeA.label} ${badgeA.value}`} />
          {badgeB && (
            <Badge label={badgeB.label} value={badgeB.value} ariaLabel={`${badgeB.label} ${badgeB.value}`} />
          )}
        </div>
      </div>
    </Link>
  );
}


