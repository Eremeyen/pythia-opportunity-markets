import { useState } from "react";
import SponsorModeOverrideSwitch from "../components/SponsorModeOverrideSwitch";
import NonSponsorEmptyState from "../components/NonSponsorEmptyState";
import SponsorMarketList from "../components/SponsorMarketList";
import SponsorMarketDetails from "../components/SponsorMarketDetails";
import TradeFeed from "../components/TradeFeed";
import ResolveDialog from "../components/ResolveDialog";
import SponsorMarketForm from "../components/SponsorMarketForm";
import { useSponsorMode } from "../hooks/useSponsorMode";
import { useMockSponsorData } from "../hooks/useMockSponsorData";

export default function ForSponsorsPage() {
  const { isSponsor } = useSponsorMode();
  // CHANGE FOLLOWING LINE FOR INTEGRATION WITH BACKEND AND PROGRAM
  const { markets, selectedMarket, selectedId, setSelectedId, trades, appendTrade, resolveMarket, createMarket } =
    useMockSponsorData();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  if (!isSponsor) {
    const now = Date.now();
    const publicMarkets = markets.filter(
      (m) => !m.isPrivate && m.status === "open" && now >= m.opportunityEndMs && (m.resultsEndMs ? now < m.resultsEndMs : true)
    );
    return (
      <div className="max-w-6xl w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0b1f3a]">For Sponsors</h2>
          <SponsorModeOverrideSwitch />
        </div>
        <NonSponsorEmptyState />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <SponsorMarketList
              markets={publicMarkets}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              onCreateClick={() => {}}
              showCreate={false}
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            {selectedMarket && publicMarkets.find((m) => m.id === selectedMarket.id) ? (
              <>
                <SponsorMarketDetails
                  market={selectedMarket}
                  sponsorMode={false}
                  onResolveClick={() => {}}
                />
                <TradeFeed
                  trades={trades}
                  marketId={selectedMarket.id}
                  sponsorMode={false}
                  onTick={() => {}}
                />
              </>
            ) : (
              <div className="p-6 rounded-xl border-2 border-black bg-white text-sm text-[#0b1f3a] opacity-80">
                Browse public markets. Select one to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0b1f3a]">Sponsors Console</h2>
        <SponsorModeOverrideSwitch />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <SponsorMarketList
            markets={markets}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            onCreateClick={() => setIsCreateOpen(true)}
          />
        </div>
        <div className="md:col-span-2 space-y-4">
          {selectedMarket ? (
            <>
              <SponsorMarketDetails
                market={selectedMarket}
                sponsorMode={isSponsor}
                onResolveClick={() => setResolveOpen(true)}
              />
              <TradeFeed
                trades={trades}
                marketId={selectedMarket.id}
                sponsorMode={isSponsor && selectedMarket.status === "open"}
                onTick={(marketId) => appendTrade(marketId)}
              />
            </>
          ) : (
            <div className="p-6 rounded-xl border-2 border-black bg-white text-sm text-[#0b1f3a] opacity-80">
              Select a market to view details.
            </div>
          )}
        </div>
      </div>

      {isCreateOpen && (
        <SponsorMarketForm
          onCreate={(input) => createMarket(input)}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
      {resolveOpen && selectedMarket && (
        <ResolveDialog
          title={selectedMarket.title}
          onResolve={(r) => {
            resolveMarket(selectedMarket.id, r);
            setResolveOpen(false);
          }}
          onClose={() => setResolveOpen(false)}
        />
      )}
    </div>
  );
}
