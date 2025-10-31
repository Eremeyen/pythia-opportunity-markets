import MarketPreviewCard from "../components/MarketPreviewCard";
import { getSponsorMarketsFiltered } from "../config/mockSponsorMarkets.ts";
import HorizontalTicker from "../components/HorizontalTicker";

export default function TrendingMarketsPage() {
  const publicItems = getSponsorMarketsFiltered("public");
  const privateItems = getSponsorMarketsFiltered("private");

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <HorizontalTicker
        title="Public markets"
        items={publicItems}
        speedMs={45_000}
        renderItem={(m) => {
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
              className="w-[320px] md:w-[360px] h-[320px] overflow-hidden shrink-0"
            />
          );
        }}
      />

      <HorizontalTicker
        title="Private markets"
        items={privateItems}
        speedMs={50_000}
        reverse
        renderItem={(m) => {
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
              className="w-[320px] md:w-[360px] h-[320px] overflow-hidden shrink-0"
            />
          );
        }}
      />
    </div>
  );
}
