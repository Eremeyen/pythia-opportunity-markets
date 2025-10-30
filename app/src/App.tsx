import "./App.css";
import { Routes, Route } from "react-router-dom";
import RootLayout from "./layouts/RootLayout";
import AboutSection from "./components/AboutSection";
import TrendingMarketsPage from "./pages/TrendingMarkets";
import ProfilePage from "./pages/Profile";
import ForSponsorsPage from "./pages/ForSponsors";
import MarketDetails from "./pages/MarketDetails";
import SponsorsPage from "./pages/Sponsors";

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route
          index
          element={
            <>
              <TrendingMarketsPage scope="trending" />
              <AboutSection />
            </>
          }
        />
        <Route
          path="/public"
          element={<TrendingMarketsPage scope="public" />}
        />
        <Route
          path="/private"
          element={<TrendingMarketsPage scope="private" />}
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/markets/:id" element={<MarketDetails />} />
        <Route path="/sponsors" element={<SponsorsPage />} />
        <Route path="/for-sponsors" element={<ForSponsorsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
