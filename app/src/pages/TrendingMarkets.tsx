import MarketPreviewCard from "../components/MarketPreviewCard";
import { getMarketsFiltered } from "../config/mockMarkets.ts";

type Scope = "trending" | "public" | "private";

export default function TrendingMarketsPage({
  scope = "trending" as Scope,
}: {
  scope?: Scope;
}) {
  // @TODO: GET ITEMS FROM HOOK
  const items = getMarketsFiltered(scope);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map((m) => (
          <MarketPreviewCard
            key={m.id}
            id={m.id}
            logoUrl={m.logoUrl}
            title={m.title}
            description={m.description}
            opportunityStartMs={m.opportunityStartMs}
            opportunityEndMs={m.opportunityEndMs}
            resultsEndMs={m.resultsEndMs}
            nextOpportunityStartMs={m.nextOpportunityStartMs}
            isPriceHidden={m.isPriceHidden}
            attentionScore={m.attentionScore}
            priceSeries={m.priceSeries}
          />
        ))}
      </div>
    </div>
  );
}
