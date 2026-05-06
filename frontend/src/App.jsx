import { useState, useRef } from "react";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Wizard from "./components/Wizard.jsx";
import ResultsPage from "./pages/ResultsPage.tsx";
import Favorites from "./components/Favorites.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import PlatformModal from "./components/PlatformModal.tsx";
import RandomSpinner from "./components/RandomSpinner.jsx";
import Footer from "./components/Footer.jsx";
import LoginModal from "./components/LoginModal.jsx";
import useFavorites from "./hooks/useFavorites.js";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { normalizeRanked, asRankedFood } from "./data/foods.ts";
import { useGeolocation } from "./hooks/useGeolocation.ts";

function AppInner() {
  const { user, logout } = useAuth();
  const [stage, setStage] = useState("hero");
  const [results, setResults] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);
  const [orderFood, setOrderFood] = useState(null);
  const [spinnerOpen, setSpinnerOpen] = useState(false);

  const [loginOpen, setLoginOpen] = useState(false);
  const [loginDefaultTab, setLoginDefaultTab] = useState("login");
  const pendingAfterAuth = useRef(null);

  const geo = useGeolocation();

  const { favorites, toggle, isFavorite } = useFavorites();

  const requestAuth = (after, tab = "login") => {
    pendingAfterAuth.current = after;
    setLoginDefaultTab(tab);
    setLoginOpen(true);
  };

  const handleAuthSuccess = () => {
    setLoginOpen(false);
    const fn = pendingAfterAuth.current;
    pendingAfterAuth.current = null;
    fn?.();
  };

  const handleStart = () => {
    if (!user) {
      requestAuth(() => setStage("wizard"));
      return;
    }
    setStage("wizard");
  };

  const [searchPreferences, setSearchPreferences] = useState(null);

  const handleComplete = (data) => {
    const ranked = (data.results || []).map((r) => normalizeRanked(r));
    setResults(ranked);
    setPreferenceId(data.preferenceId);
    setSearchPreferences(data.preferences ?? null);
    try {
      if (data.preferences) {
        sessionStorage.setItem(
          "ne_yesem_last_prefs",
          JSON.stringify(data.preferences)
        );
      }
    } catch {
      /* gizli mod vb. */
    }
    setStage("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    setStage("wizard");
    setResults(null);
    setPreferenceId(null);
    setSearchPreferences(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (target) => {
    if (target === "admin" && !user) {
      requestAuth(() => setStage("admin"));
      return;
    }
    setStage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openLoginFromHeader = () => {
    pendingAfterAuth.current = null;
    setLoginDefaultTab("login");
    setLoginOpen(true);
  };

  const handleLogout = () => {
    logout();
    if (["wizard", "results", "admin", "favorites"].includes(stage)) {
      setStage("hero");
      setResults(null);
      setPreferenceId(null);
      setSearchPreferences(null);
    }
  };

  const openRegisterFromHeader = () => {
    pendingAfterAuth.current = null;
    setLoginDefaultTab("register");
    setLoginOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        stage={stage}
        onNavigate={handleNavigate}
        favoriteCount={favorites.length}
        user={user}
        onLoginClick={openLoginFromHeader}
        onRegisterClick={openRegisterFromHeader}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {stage === "hero" && (
          <Hero
            onStart={handleStart}
            onRandom={() => setSpinnerOpen(true)}
          />
        )}
        {stage === "wizard" && <Wizard onComplete={handleComplete} />}
        {stage === "results" && (
          <ResultsPage
            results={results}
            preferenceId={preferenceId}
            searchPreferences={searchPreferences}
            geoCoords={geo.coords}
            geoHint={geo.error}
            onRequestLocation={geo.request}
            onRestart={handleRestart}
            isFavorite={isFavorite}
            onToggleFavorite={toggle}
          />
        )}
        {stage === "favorites" && (
          <Favorites
            favorites={favorites}
            onRemove={toggle}
            onOrder={(food) => setOrderFood(asRankedFood(food))}
            onGoHero={() => handleNavigate("hero")}
          />
        )}
        {stage === "admin" && <AdminPanel />}
      </main>

      <Footer />

      <PlatformModal
        food={orderFood}
        geoCoords={geo.coords}
        onClose={() => setOrderFood(null)}
        onTrackClick={() => {}}
      />

      <RandomSpinner
        open={spinnerOpen}
        onClose={() => setSpinnerOpen(false)}
        onOrder={(food) => setOrderFood(asRankedFood(food))}
      />

      <LoginModal
        open={loginOpen}
        onClose={() => {
          setLoginOpen(false);
          pendingAfterAuth.current = null;
        }}
        onSuccess={handleAuthSuccess}
        defaultTab={loginDefaultTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
