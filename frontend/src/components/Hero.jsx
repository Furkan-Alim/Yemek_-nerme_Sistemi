import { useState } from "react";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  Flame,
  Heart,
  Clock,
  Dices,
} from "lucide-react";

export default function Hero({ onStart, onRandom }) {
  return (
    <section className="animated-bg min-h-[calc(100vh-4rem)] flex items-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur border border-brand-200 text-brand-700 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            Akıllı Yemek Öneri Sistemi
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            <span className="block">Bugün ne</span>
            <span className="bg-gradient-to-r from-brand-500 via-brand-600 to-red-500 bg-clip-text text-transparent">
              yesen ki?
            </span>
          </h1>

          <p className="text-lg text-slate-600 mb-8 max-w-lg">
            Birkaç soruya cevap ver, sana tam uygun yemekleri önerelim. 
            Beğendiğine tıkla, Yemeksepeti'nden tek tıkla sipariş ver.
          </p>

          <div className="flex flex-wrap gap-3">
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary text-lg px-7 py-4"
            >
              Hadi Başlayalım
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              onClick={onRandom}
              whileHover={{ scale: 1.03, rotate: [0, -2, 2, 0] }}
              whileTap={{ scale: 0.97 }}
              transition={{ rotate: { duration: 0.3 } }}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-semibold text-lg bg-white border-2 border-slate-200 text-slate-800 hover:border-brand-400 hover:bg-brand-50 transition"
            >
              <Dices className="w-5 h-5 text-brand-600" />
              Rastgele Seç
            </motion.button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-sm text-slate-600">
            <Feature icon={<Flame className="w-4 h-4 text-brand-500" />} text="70+ Yemek" />
            <Feature icon={<Heart className="w-4 h-4 text-rose-500" />} text="Sana Özel" />
            <Feature icon={<Clock className="w-4 h-4 text-emerald-600" />} text="30 Saniye" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative grid grid-cols-2 gap-4">
            <FloatingFood
              src="/images/foods/lahmacun.jpg"
              alt="Lahmacun"
              delay={0}
              className="translate-y-4"
              gradient="from-amber-100 via-orange-100 to-rose-100"
            />
            <FloatingFood
              src="/images/foods/iskender.jpg"
              alt="İskender kebap"
              delay={0.3}
              className="-translate-y-4"
              gradient="from-red-100 via-rose-100 to-orange-100"
            />
            <FloatingFood
              src="/images/foods/menemen.jpg"
              alt="Menemen"
              delay={0.6}
              className="-translate-y-2"
              gradient="from-emerald-100 via-teal-50 to-cyan-100"
            />
            <FloatingFood
              src="/images/foods/cheeseburger.jpg"
              alt="Cheeseburger"
              delay={0.9}
              className="translate-y-2"
              gradient="from-violet-100 via-purple-50 to-fuchsia-100"
            />
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-slate-100"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <UtensilsCrossed className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Şimdi öneri aldı</div>
              <div className="font-semibold text-sm">1.248 kişi</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Feature({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-medium">{text}</span>
    </div>
  );
}

function FloatingFood({ src, alt, delay, className, gradient }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay }}
        className={`aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-br ${gradient} flex items-center justify-center ${className}`}
        aria-hidden
      >
        <UtensilsCrossed className="w-16 h-16 text-white/90 drop-shadow-md" />
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, delay }}
      className={`aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </motion.div>
  );
}
