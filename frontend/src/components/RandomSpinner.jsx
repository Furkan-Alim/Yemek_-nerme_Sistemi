import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, X, RotateCw, ShoppingBag, Flame } from "lucide-react";
import FoodImage from "./FoodImage.jsx";
import { getFoodsNormalized } from "../data/foods.ts";

const foods = getFoodsNormalized();

export default function RandomSpinner({ open, onClose, onOrder }) {
  const [spinning, setSpinning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (open) {
      setResult(null);
      setSpinning(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  const spin = () => {
    setResult(null);
    setSpinning(true);
    let speed = 60;
    let ticks = 0;
    const totalTicks = 30;

    const tick = () => {
      setCurrentIndex(Math.floor(Math.random() * foods.length));
      ticks++;
      if (ticks < totalTicks) {
        speed += 15;
        intervalRef.current = setTimeout(tick, speed);
      } else {
        const final = Math.floor(Math.random() * foods.length);
        setCurrentIndex(final);
        setResult(foods[final]);
        setSpinning(false);
      }
    };
    tick();
  };

  if (!open) return null;

  const displayFood = result || foods[currentIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={spinning ? undefined : onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          <div className="relative p-5 bg-gradient-to-br from-brand-500 to-rose-500 text-white">
            <button
              type="button"
              onClick={onClose}
              disabled={spinning}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Dices className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-semibold opacity-90">Şans Çarkı</div>
                <div className="text-xl font-bold">Bugün Ne Yesem?</div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={displayFood.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: spinning ? 0.1 : 0.3 }}
                  className="w-full h-full"
                >
                  <FoodImage
                    imageUrl={displayFood.imageUrl}
                    imageAlt={displayFood.imageAlt}
                    alt={displayFood.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {spinning && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4">
                  <div className="text-white font-bold text-2xl flex items-center gap-2">
                    <Dices className="w-6 h-6 animate-spin" />
                    Seçiliyor...
                  </div>
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-full px-3 py-1 text-xs font-bold text-slate-700 flex items-center gap-1 shadow"
                >
                  <Flame className="w-3.5 h-3.5 text-brand-500" />
                  {result.calories} kcal
                </motion.div>
              )}
            </div>

            <div className="text-center mb-4">
              <motion.div
                key={displayFood.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`font-bold ${
                  result ? "text-3xl" : "text-2xl"
                } ${spinning ? "text-slate-400" : "text-slate-900"}`}
              >
                {displayFood.name}
              </motion.div>
              {result && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-slate-500 text-sm mt-1 px-4"
                >
                  {result.description}
                </motion.p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={spin}
                disabled={spinning}
                className="flex-1 btn-ghost border-2 border-slate-200 disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${spinning ? "animate-spin" : ""}`} />
                {result ? "Tekrar Çevir" : spinning ? "Çevriliyor" : "Çarkı Çevir"}
              </button>
              {result && (
                <button
                  type="button"
                  onClick={() => {
                    onOrder?.(result);
                    onClose();
                  }}
                  className="flex-1 btn-primary"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Platformda ara
                </button>
              )}
            </div>

            {!result && !spinning && (
              <p className="text-xs text-slate-400 text-center mt-4">
                Karar veremiyorsan şans çarkı senin için seçsin
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
