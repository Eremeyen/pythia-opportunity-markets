export default function AboutSection() {
  return (
    <section aria-labelledby="about-pythia" className="mt-10">
      <div className="group p-[3px] rounded-2xl bg-gradient-to-r from-[#0b1f3a] via-[#174a8c] to-[#6b5b95]">
        <div className="h-full bg-white rounded-[calc(1rem-3px)] border-4 border-black p-5 md:p-7">
          <h2
            id="about-pythia"
            className="text-2xl md:text-3xl font-extrabold text-[#0b1f3a] mb-3"
          >
            About Pythia's Opportunity Markets
          </h2>
          <div className="space-y-3 text-[#0b1f3a]">
            <p>
              We are building a platform where domain experts, signal-finders,
              and scouts share insights and place wagers on the success of
              early-stage startups. Sponsors use these markets to discover
              high-signal opportunities and to reward accurate research. The
              design is inspired by {""}
              <a
                href="https://www.paradigm.xyz/2025/08/opportunity-markets"
                target="_blank"
                rel="noreferrer"
              >
                Opportunity Markets
              </a>
              .
            </p>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                Sponsors open markets like “Will we fund startup X within the
                next 6 months?”, seed initial liquidity (typically in NO), and
                define resolution criteria.
              </li>
              <li>
                Signal providers buy YES and submit notes/research to the
                sponsor.
              </li>
              <li>
                During the opportunity window, prices and fills are hidden to
                everyone except the sponsor; traders operate blind, reducing
                herding.
              </li>
              <li>
                After resolution, if YES, contributors are paid and reputation
                signals are recorded.
              </li>
            </ol>
            <p>
              Motivation: enable people to price unique knowledge and surface
              insightful contributors earlier. The resulting data helps sponsors
              conduct informed diligence.
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Challenge — Blind trading: traders cannot see prices during the
                window; we provide coarse attention signals instead of price.
              </li>
              <li>
                Challenge — Sponsor integrity: v0 assumes reputable sponsors
                with restricted actions.
              </li>
            </ul>
            <div>
              <p className="font-bold">Technical components</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Client: submit findings and trades; sponsors view market state
                  and resolve outcomes.
                </li>
                <li>
                  Onchain program: escrows assets and settles after resolution;
                  explores SPL Token-2022 confidential transfers.
                </li>
                <li>
                  Backend/indexer: aggregates requests for sponsor views; tracks
                  market activity and status for the client UI.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
