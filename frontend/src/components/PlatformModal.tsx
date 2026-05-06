import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Info, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import FoodImage from "./FoodImage.jsx";
import type { Food } from "../types/food";
import type { GeoCoords } from "../hooks/useGeolocation";
import {
  buildPlatformSearchQuery,
  buildGetirUrl,
  buildTrendyolGoUrl,
  buildYemeksepetiUrl,
} from "../utils/platformSearch";

const PLATFORMS = [
  {
    id: "yemeksepeti",
    name: "Yemeksepeti",
    color: "from-pink-500 to-rose-600",
    logo: "🛵",
    copyClipboard: true,
    buildUrl: buildYemeksepetiUrl,
  },
  {
    id: "getir",
    name: "Getir Yemek",
    color: "from-purple-500 to-indigo-600",
    logo: "🏍️",
    copyClipboard: true,
    buildUrl: buildGetirUrl,
  },
  {
    id: "trendyolgo",
    name: "Trendyol Go",
    color: "from-orange-500 to-amber-600",
    logo: "🍜",
    copyClipboard: true,
    buildUrl: buildTrendyolGoUrl,
  },
] as const;

interface PlatformModalProps {
  food: Food | null;
  geoCoords?: GeoCoords | null;
  onClose: () => void;
  onTrackClick?: (food: Food) => void;
}

export default function PlatformModal({
  food,
  geoCoords = null,
  onClose,
  onTrackClick,
}: PlatformModalProps) {
  const [clipboardHint, setClipboardHint] = useState<string | null>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (!clipboardHint) return;
    const t = window.setTimeout(() => setClipboardHint(null), 4500);
    return () => clearTimeout(t);
  }, [clipboardHint]);

  if (!food) return null;

  const searchText = buildPlatformSearchQuery(food);

  const handleOpen = async (platform: (typeof PLATFORMS)[number]) => {
    onTrackClick?.(food);
    if (platform.copyClipboard) {
      try {
        await navigator.clipboard?.writeText?.(searchText);
        setClipboardHint(
          "Arama metni panoya kopyalandı; platformda kutuya yapıştırabilirsin."
        );
      } catch {
        setClipboardHint(null);
      }
    }
    const url = platform.buildUrl(food);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => onClose(), 1600);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative"
        >
          <div className="relative h-40 overflow-hidden">
            <FoodImage
              imageUrl={food.imageUrl}
              imageAlt={food.imageAlt}
              alt={food.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition"
              aria-label="Kapat"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <div className="text-xs font-semibold opacity-90">Platformda ara</div>
              <div className="text-xl font-bold">{food.name}</div>
            </div>
          </div>

          <div className="p-6 space-y-3">
            {clipboardHint && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
                {clipboardHint}
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex gap-2 items-start text-xs text-amber-950 leading-relaxed">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  Arama platformda yalnızca yemek adıyla açılır.
                </p>
                <p>
                  Kalori ve diyet gibi kişisel filtreler Yemeksepeti / Getir /
                  Trendyol Go tarafında bu siteden doğrudan uygulanamaz; bu
                  yüzden öneriler <strong>Ne Yesem?</strong> içinde
                  filtrelenir. Platformda bütçe, mutfak veya puan gibi
                  desteklenen filtreleri kendin seçebilirsin.
                </p>
                {geoCoords && (
                  <p className="mt-2 flex items-center gap-1 text-amber-900/90">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    Konumun kayıtlı; liste yine platformun kendi konumuna göre
                    gelir.
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-semibold text-slate-800">Arama metni: </span>
              <strong className="break-words">&ldquo;{searchText}&rdquo;</strong>
            </div>

            <p className="text-sm text-slate-500 font-medium">Platform seç:</p>

            <div className="space-y-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleOpen(p)}
                  className={`w-full p-4 rounded-2xl text-left bg-gradient-to-r ${p.color} text-white shadow-md hover:shadow-xl hover:scale-[1.02] transition-all group`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0">{p.logo}</span>
                      <div className="min-w-0">
                        <div className="font-bold">{p.name}</div>
                        <div className="text-xs opacity-90 truncate">{searchText}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 opacity-70 group-hover:opacity-100 shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
