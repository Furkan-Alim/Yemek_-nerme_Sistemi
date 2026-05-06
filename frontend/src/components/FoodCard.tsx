import { motion } from "framer-motion";
import {
  Flame,
  Heart,
  Search,
  Tag,
  Wallet,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import type { RankedFood, UserPreferences } from "../types/food";
import FoodImage from "./FoodImage.jsx";

const BUDGET_LABEL: Record<string, string> = {
  ucuz: "Ekonomik",
  orta: "Orta bütçe",
  premium: "Premium",
  fark_etmez: "Bütçe esnek",
};

const HUNGER_CARD: Record<string, string> = {
  hafif: "Hafif porsiyon",
  orta: "Dengeli porsiyon",
  cok_ac: "Doyurucu porsiyon",
};

interface FoodCardProps {
  food: RankedFood;
  index: number;
  preferences: UserPreferences | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPlatformSearch: () => void;
}

export default function FoodCard({
  food,
  index,
  preferences,
  isFavorite,
  onToggleFavorite,
  onPlatformSearch,
}: FoodCardProps) {
  const dietLabel =
    food.diet.length > 0
      ? `Diyet: ${food.diet.join(", ")}`
      : food.dietType === "genel"
        ? "Diyet: genel"
        : preferences?.diet && preferences.diet !== "fark_etmez"
          ? `Seçim: ${preferences.diet} (bu yemek etiketlenmemiş)`
          : "Diyet: genel";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="card group relative flex flex-col"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`absolute top-3 right-3 z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isFavorite
            ? "bg-rose-500 text-white"
            : "bg-white/95 text-slate-400 hover:text-rose-500"
        }`}
        aria-label={isFavorite ? "Favoriden çıkar" : "Favorilere ekle"}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
      </button>

      <div className="relative overflow-hidden aspect-[4/3] shrink-0">
        <FoodImage
          key={`${food.id}-${food.imageUrl ?? "none"}`}
          imageUrl={food.imageUrl}
          imageAlt={food.imageAlt}
          alt={food.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
          <span className="bg-white/95 backdrop-blur rounded-full px-2.5 py-0.5 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow">
            <Flame className="w-3 h-3 text-brand-500" />
            {food.calories} kcal
          </span>
          <span className="bg-brand-500/95 text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow">
            {food.cuisine}
          </span>
          <span className="bg-emerald-600/95 text-white rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            %{food.matchPercent} uyumlu
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg mb-1 group-hover:text-brand-600 transition-colors pr-8">
          {food.name}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-3">
          {food.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-100 flex items-center gap-1">
            <Wallet className="w-3 h-3" />
            {BUDGET_LABEL[food.budgetLevel] ?? food.budgetLevel}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-800 font-semibold border border-violet-100 flex items-center gap-1">
            <UtensilsCrossed className="w-3 h-3" />
            {HUNGER_CARD[food.hungerLevel] ?? food.portion}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100">
            {dietLabel}
          </span>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 leading-relaxed flex-1">
          <span className="font-semibold text-brand-600">Neden önerildi? </span>
          {food.matchExplanation}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {food.tags.slice(0, 5).map((t) => (
            <span
              key={t}
              className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {t}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onPlatformSearch}
          className="btn-primary w-full mt-auto flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Platformda ara
        </button>
      </div>
    </motion.div>
  );
}
