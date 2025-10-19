import "./App.css";
import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import MarketPreviewCard from "./components/MarketPreviewCard";
import AboutSection from "./components/AboutSection";

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route
          index
          element={
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                {
                  logoUrl: "/logos/apple.svg",
                  title: "Will Y Combinator fund Orchard AI in the next 6 months?",
                  description: "",
                  isPriceHidden: true,
                },
                {
                  logoUrl: "/logos/google.svg",
                  title: "Will a16z fund AtlasDB this quarter?",
                  description: "",
                  isPriceHidden: false,
                },
                {
                  logoUrl: "/logos/amazon.svg",
                  title: "Will Sequoia fund RiverCart by Q2?",
                  description: "",
                  isPriceHidden: true,
                },
                {
                  logoUrl: "/logos/microsoft.svg",
                  title: "Will Accel fund CursorForge by Q1?",
                  description: "",
                  isPriceHidden: false,
                },
                {
                  logoUrl: "/logos/nvidia.svg",
                  title: "Will Greylock fund TensorMesh this cycle?",
                  description: "",
                  isPriceHidden: true,
                },
                {
                  logoUrl: "/logos/google.svg",
                  title: "Will Founders Fund back LoomStack by June?",
                  description: "",
                  isPriceHidden: false,
                },
                ].map((m, i) => (
                  <MarketPreviewCard
                    key={i}
                    id={`m-${i}`}
                    logoUrl={m.logoUrl}
                    title={m.title}
                    description={m.description}
                    opportunityStartMs={Date.now() - 60_000}
                    opportunityEndMs={Date.now() + (i % 2 === 0 ? 72 : 12) * 3600_000}
                    resultsEndMs={Date.now() + 30 * 24 * 3600_000}
                    nextOpportunityStartMs={Date.now() + 45 * 24 * 3600_000}
                    isPriceHidden={m.isPriceHidden}
                    attentionScore={(i + 1) / 6}
                    priceSeries={[...Array(24)].map((_, idx) => 100 + Math.sin(idx / 3) * 2 + idx * 0.3)}
                  />
                ))}
              </div>
              <AboutSection />
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
