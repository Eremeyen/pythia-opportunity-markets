import { useState } from "react";
import SponsorMarketList from "../components/SponsorMarketList";
import SponsorMarketDetails from "../components/SponsorMarketDetails";
import TradeFeed from "../components/TradeFeed";
import ResolveDialog from "../components/ResolveDialog";
import SponsorMarketForm from "../components/SponsorMarketForm";
import { useSponsorMarkets } from "../hooks/useSponsorMarkets";
import { useMockTrades } from "../hooks/useMockTrades";

export default function ForSponsorsPage() {
  const isSponsor = true;
  // CHANGE FOLLOWING LINE FOR INTEGRATION WITH BACKEND AND PROGRAM
  const { markets, selectedMarket, selectedId, setSelectedId, onResolve, onCreate, loading } =
    useSponsorMarkets();
  const { getTrades, appendTrade } = useMockTrades(markets);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);

  if (loading) {
    return (
      <div className="max-w-7xl w-full">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0b1f3a]">Sponsors Console</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-8">
          <div className="md:col-span-1">
            <div className="p-4 rounded-xl border-2 border-black bg-white text-sm text-[#0b1f3a] opacity-80">
              Loading markets…
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 rounded-xl border-2 border-black bg-white text-sm text-[#0b1f3a] opacity-80">
              Loading details…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#0b1f3a]">Sponsors Console</h2>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-8">
        <div className="md:col-span-1">
          <SponsorMarketList
            markets={markets}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            onCreateClick={() => setIsCreateOpen(true)}
          />
        </div>
        <div className="space-y-6">
          {selectedMarket ? (
            <>
              <SponsorMarketDetails
                market={selectedMarket}
                sponsorMode={isSponsor}
                onResolveClick={() => setResolveOpen(true)}
              />
              <TradeFeed
                trades={getTrades(selectedMarket.id)}
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
          onCreate={(input) => onCreate(input)}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
      {resolveOpen && selectedMarket && (
        <ResolveDialog
          title={selectedMarket.title}
          onResolve={(r) => {
            onResolve(selectedMarket.id, r);
            setResolveOpen(false);
          }}
          onClose={() => setResolveOpen(false)}
        />
      )}
    </div>
  );
}
