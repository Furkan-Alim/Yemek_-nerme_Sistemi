import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  SlidersHorizontal,
  ArrowDownUp,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { RankedFood, UserPreferences } from "../types/food";
import FoodCard from "../components/FoodCard";
import PlatformModal from "../components/PlatformModal";
import { apiFetch } from "../utils/api.js";
import { briefFilterSummary } from "../utils/platformSearch";
import type { GeoCoords } from "../hooks/useGeolocation";

const SORT_OPTIONS = [
  { id: "match", label: "En uygun (skor)" },
  { id: "cal_asc", label: "Kalori ↑" },
  { id: "cal_desc", label: "Kalori ↓" },
  { id: "name_asc", label: "A → Z" },
];

interface ResultsPageProps {
  results: RankedFood[];
  preferenceId: number | null;
  searchPreferences: UserPreferences | null;
  geoCoords: GeoCoords | null;
  geoHint: string | null;
  onRequestLocation: () => void;
  onRestart: () => void;
  isFavorite: (id: number) => boolean;
  onToggleFavorite: (food: RankedFood) => void;
}

export default function ResultsPage({
  results,
  preferenceId,
  searchPreferences,
  geoCoords,
  geoHint,
  onRequestLocation,
  onRestart,
  isFavorite,
  onToggleFavorite,
}: ResultsPageProps) {
  const [platformFood, setPlatformFood] = useState<RankedFood | null>(null);
  const [sort, setSort] = useState("match");
  const [cuisineFilter, setCuisineFilter] = useState("all");

  const filterSummary = briefFilterSummary(searchPreferences);

  const cuisines = useMemo(() => {
    const set = new Set((results || []).map((f) => f.cuisine));
    return Array.from(set);
  }, [results]);

  const filtered = useMemo(() => {
    if (!results) return [];
    let list = [...results];
    if (cuisineFilter !== "all") {
      list = list.filter((f) => f.cuisine === cuisineFilter);
    }
    if (sort === "cal_asc") list.sort((a, b) => a.calories - b.calories);
    else if (sort === "cal_desc") list.sort((a, b) => b.calories - a.calories);
    else if (sort === "name_asc")
      list.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    else list.sort((a, b) => b.matchScore - a.matchScore);
    return list;
  }, [results, sort, cuisineFilter]);

  const handleTrackClick = async (food: RankedFood) => {
    try {
      await apiFetch("/api/click", {
        method: "POST",
        body: JSON.stringify({ preferenceId, foodId: food.id }),
      });
    } catch {
      /* sessiz */
    }
  };

  if (!results || results.length === 0) {
    return (
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="text-center max-w-md text-slate-600">
          <h2 className="text-2xl font-bold mb-2 text-slate-800">
            Kriterlerine uyan yemek bulamadık
          </h2>
          <p className="mb-6">Biraz daha esnek filtrelerle tekrar dene.</p>
          <button type="button" onClick={onRestart} className="btn-primary">
            <RotateCcw className="w-4 h-4" />
            Yeniden Dene
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8"
        >
          <div className="max-w-3xl">
            <div className="text-sm font-semibold text-brand-600 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Sana en uygun öneriler
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {filtered.length} yemek seçtik
            </h1>
            <p className="text-slate-600 mt-3 leading-relaxed">
              <strong className="text-slate-800">Neden bu yemekler?</strong>{" "}
              Kalori hedefin, mutfak ve diyet seçimin, açlık / bütçe / tat
              profilinle her kart için bir uyum skoru hesapladık; en yüksek skor
              üstte. Siparişe geçmeden önce platformda mutfak filtrelerini yine
              sen daraltabilirsin.
            </p>
            {filterSummary && (
              <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Filtre özeti
                </div>
                <p className="text-sm font-medium text-slate-800">{filterSummary}</p>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRequestLocation}
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-xl px-4 py-2 hover:bg-brand-100 transition"
              >
                <MapPin className="w-4 h-4" />
                Konum izni ver
              </button>
              {geoHint && (
                <span className="text-xs text-slate-500 max-w-md">{geoHint}</span>
              )}
              {geoCoords && (
                <span className="text-xs text-emerald-700 font-medium">
                  Konum kaydedildi ({geoCoords.lat.toFixed(2)},{" "}
                  {geoCoords.lng.toFixed(2)})
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="btn-ghost border border-slate-200 shrink-0 self-start"
          >
            <RotateCcw className="w-4 h-4" />
            Baştan Başla
          </button>
        </motion.div>

        <div className="card p-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 pr-3 border-r border-slate-200">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Mutfak</span>
          </div>

          <button
            type="button"
            onClick={() => setCuisineFilter("all")}
            className={`chip ${cuisineFilter === "all" ? "chip-active" : ""}`}
          >
            Tümü ({results.length})
          </button>
          {cuisines.map((c) => {
            const count = results.filter((f) => f.cuisine === c).length;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCuisineFilter(c)}
                className={`chip ${cuisineFilter === c ? "chip-active" : ""}`}
              >
                {c} ({count})
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2">
            <ArrowDownUp className="w-4 h-4 text-slate-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-sm font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer hover:border-brand-400 focus:outline-none focus:border-brand-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            Bu filtreye uygun yemek yok, başka mutfak dene.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((food, i) => (
              <FoodCard
                key={food.id}
                food={food}
                index={i}
                preferences={searchPreferences}
                isFavorite={isFavorite(food.id)}
                onToggleFavorite={() => onToggleFavorite(food)}
                onPlatformSearch={() => setPlatformFood(food)}
              />
            ))}
          </div>
        )}
      </div>

      <PlatformModal
        food={platformFood}
        geoCoords={geoCoords}
        onClose={() => setPlatformFood(null)}
        onTrackClick={handleTrackClick}
      />
    </section>
  );
}
