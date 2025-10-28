import MarketPreviewCard from "../components/MarketPreviewCard";
import { MOCK_SPONSORS } from "../config/mockSponsors.ts";

export default function SponsorsPage() {
  // FIX LOADING STATE
  const loading = false;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-neutral-200 border-2 border-black rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-56 bg-neutral-100 border-4 border-black rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0b1f3a]">
            Sponsors
          </h2>
        </div>
        <div className="mt-4 space-y-10">
          {/* @TODO: IMPLEMENT AND CALL A HOOK TO GET SPONSORS AND THEIR MARKETS (OR RETRIEVE FROM MEMORY), AND PASS THAT INTO A HIGHER LEVEL COMPONENT */}
          {MOCK_SPONSORS.map((s) => (
            <div
              key={s.id}
              className="border-4 border-black rounded-2xl p-5 bg-white"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-black bg-neutral-100 overflow-hidden">
                  {s.logoUrl && (
                    <img
                      src={s.logoUrl}
                      alt="Sponsor logo"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xl md:text-2xl font-extrabold text-[#0b1f3a]">
                    {s.name}
                  </div>
                  <p className="mt-1 text-sm md:text-base text-[#0b1f3a] opacity-80">
                    {s.description}
                  </p>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-2 underline text-xs md:text-sm"
                    >
                      Sponsor site
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {s.sampleMarkets.map((m) => (
                  <MarketPreviewCard
                    key={m.id}
                    id={m.id}
                    logoUrl={m.company.logoUrl ?? ""}
                    title={m.title}
                    description={m.description ?? ""}
                    opportunityStartMs={Date.now() - 60_000}
                    opportunityEndMs={m.opportunityEndMs}
                    resultsEndMs={m.resultsEndMs}
                    isPriceHidden={m.isPriceHidden}
                    attentionScore={m.attentionScore}
                    priceSeries={m.priceSeries}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
