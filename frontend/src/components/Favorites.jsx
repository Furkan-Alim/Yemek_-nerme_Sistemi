import { motion, AnimatePresence } from "framer-motion";
import { Heart, Flame, ShoppingBag, Trash2, HeartOff } from "lucide-react";
import FoodImage from "./FoodImage.jsx";
import { asRankedFood } from "../data/foods.ts";

export default function Favorites({ favorites, onRemove, onOrder, onGoHero }) {
  if (favorites.length === 0) {
    return (
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-rose-50 flex items-center justify-center">
            <HeartOff className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2">Henüz favori yok</h2>
          <p className="text-slate-500 mb-6">
            Sonuç sayfasındaki kartlarda sağ üstteki kalp ikonuna tıklayarak
            sevdiğin yemekleri buraya ekleyebilirsin.
          </p>
          <button onClick={onGoHero} className="btn-primary">
            <Heart className="w-4 h-4" />
            Yemek Keşfet
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="text-sm font-semibold text-rose-600 mb-1">
            Favorilerim
          </div>
          <h1 className="text-4xl font-extrabold">
            {favorites.length} sevdiğin yemek
          </h1>
          <p className="text-slate-500 mt-2">
            Bu liste sadece senin tarayıcında saklanır.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {favorites.map((raw, i) => {
              const food = asRankedFood(raw);
              return (
              <motion.div
                key={food.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04 }}
                className="card group relative"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <FoodImage
                    imageUrl={food.imageUrl}
                    imageAlt={food.imageAlt}
                    alt={food.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(raw)}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/95 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-lg transition-all group/btn"
                    title="Favorilerden çıkar"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500 group-hover/btn:text-white" />
                  </button>
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-full px-3 py-1 text-xs font-bold text-slate-700 flex items-center gap-1 shadow">
                    <Flame className="w-3.5 h-3.5 text-brand-500" />
                    {food.calories} kcal
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-lg">{food.name}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 font-semibold whitespace-nowrap">
                      {food.cuisine}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                    {food.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOrder(food)}
                    className="w-full btn-primary"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Platformda ara
                  </button>
                </div>
              </motion.div>
            );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
