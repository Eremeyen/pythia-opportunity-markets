import { useParams } from "react-router-dom";
import { useState } from "react";
import Sparkline from "../components/Sparkline";
import { useMarket } from "../hooks/useMarket";

export default function MarketDetails() {
  const { id } = useParams<{ id: string }>();
  const { market } = useMarket(id);
  const [amount, setAmount] = useState<string>("");

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

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-8 items-start">
        <div className="space-y-8">
          <header className="flex gap-6 items-start">
            {market.company.logoUrl && (
              <img
                src={market.company.logoUrl}
                alt="Company logo"
                className="w-16 h-16 md:w-20 md:h-20"
              />
            )}
            <div className="min-w-0">
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0b1f3a]">
                {market.title}
              </h2>
              {market.description && (
                <p className="mt-2 text-base md:text-lg text-[#0b1f3a] opacity-80">
                  {market.description}
                </p>
              )}
              <div className="mt-2 text-sm md:text-base text-[#0b1f3a]">
                Estimated resolution:{" "}
                <span className="font-bold">{estimatedDate}</span>
              </div>
            </div>
          </header>

          <section className="min-h-[320px]">
            {market.isPriceHidden ? (
              <div className="h-[380px] flex items-start justify-start p-4 text-[#0b1f3a] font-extrabold text-lg md:text-xl">
                Price hidden during opportunity window
              </div>
            ) : (
              <Sparkline
                values={market.priceSeries ?? []}
                width={1200}
                height={420}
                stroke="#0b1f3a"
                fill="#0b1f3a10"
                className="w-full"
              />
            )}
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            </section>
            <section>
              <h4 className="text-lg md:text-xl font-extrabold text-[#0b1f3a]">
                Sponsor
              </h4>
              <div className="mt-3 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-neutral-200 border-2 border-black" />
                <div>
                  <div className="font-bold text-[#0b1f3a] text-sm md:text-base">
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
            </section>
          </div>
        </div>

        <aside className="border-4 border-black rounded-2xl p-5 bg-white">
          <h3 className="text-xl md:text-2xl font-extrabold text-[#0b1f3a]">
            Trade
          </h3>
          <label
            className="block mt-4 text-sm md:text-base font-bold text-[#0b1f3a]"
            htmlFor="amount"
          >
            Amount (USD)
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
      </div>
    </div>
  );
}
