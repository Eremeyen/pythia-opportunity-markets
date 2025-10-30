import MarketPreviewCard from "../components/MarketPreviewCard";
import { getSponsorMarketsFiltered } from "../config/mockSponsorMarkets.ts";

type Scope = "trending" | "public" | "private";

export default function TrendingMarketsPage({
  scope = "trending" as Scope,
}: {
  scope?: Scope;
}) {
  const items = getSponsorMarketsFiltered(scope);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map((m) => {
          const opportunityStartMs = m.opportunityEndMs - 24 * 3600_000; // mock start time
          return (
          <MarketPreviewCard
            key={m.id}
            id={m.id}
            logoUrl={m.company?.logoUrl ?? ""}
            title={m.title}
            description={m.description ?? ""}
            opportunityStartMs={opportunityStartMs}
            opportunityEndMs={m.opportunityEndMs}
            resultsEndMs={m.resultsEndMs}
            nextOpportunityStartMs={m.nextOpportunityStartMs}
            isPriceHidden={m.isPriceHidden}
            attentionScore={m.attentionScore}
            priceSeries={m.priceSeries}
          />
          );
        })}
      </div>
    </div>
  );
}
