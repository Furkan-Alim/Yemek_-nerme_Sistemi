import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Sunrise,
  Moon,
  Cookie,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { apiFetch } from "../utils/api.js";

const MEAL_OPTIONS = [
  { id: "Kahvaltı", label: "Kahvaltı", icon: Sunrise, desc: "Güne enerjik başla" },
  { id: "Öğle", label: "Öğle", icon: Sun, desc: "Güç toplama zamanı" },
  { id: "Akşam", label: "Akşam", icon: Moon, desc: "Günü taçlandır" },
  { id: "Atıştırmalık", label: "Atıştırmalık", icon: Cookie, desc: "Arada bir kaçamak" },
];

const CUISINE_OPTIONS = [
  "Türk",
  "İtalyan",
  "Fast Food",
  "Uzak Doğu",
  "Meksika",
  "Deniz Ürünleri",
  "Sağlıklı",
  "Tatlı",
  "Orta Doğu",
];

const DIET_OPTIONS = [
  { id: "fark_etmez", label: "Fark Etmez" },
  { id: "vejetaryen", label: "Vejetaryen" },
  { id: "vegan", label: "Vegan" },
  { id: "glutensiz", label: "Glutensiz" },
];

const HUNGER_OPTIONS = [
  { id: "hafif", label: "Hafif", emoji: "🙂", desc: "Küçük porsiyon yeter" },
  { id: "orta", label: "Orta", emoji: "😋", desc: "Normal öğün" },
  { id: "cok_ac", label: "Çok Aç", emoji: "🤤", desc: "Büyük porsiyon" },
];

const BUDGET_OPTIONS = [
  { id: "fark_etmez", label: "Fark Etmez" },
  { id: "ucuz", label: "Ekonomik" },
  { id: "orta", label: "Orta" },
  { id: "premium", label: "Premium" },
];

const MOOD_OPTIONS = [
  { id: "tatlı", label: "Tatlı", emoji: "🍰" },
  { id: "tuzlu", label: "Tuzlu", emoji: "🧂" },
  { id: "baharatlı", label: "Baharatlı", emoji: "🌶️" },
  { id: "yağlı", label: "Yağlı / Doyurucu", emoji: "🧀" },
  { id: "ferahlatıcı", label: "Ferahlatıcı", emoji: "🥗" },
];

const STEPS = [
  { key: "meal", title: "Hangi öğün için?", subtitle: "Başlayalım" },
  { key: "calories", title: "Kalori aralığın?", subtitle: "Yaklaşık kalori hedefin" },
  { key: "cuisines", title: "Hangi mutfaklar?", subtitle: "Birden fazla seçebilirsin" },
  { key: "diet", title: "Diyet kısıtın var mı?", subtitle: "Filtreleyelim" },
  { key: "hunger", title: "Ne kadar açsın?", subtitle: "Porsiyon büyüklüğü" },
  { key: "budget", title: "Bütçe aralığın?", subtitle: "Cebine göre" },
  { key: "mood", title: "Bugün canın ne çekiyor?", subtitle: "Birden fazla seçebilirsin" },
];

function guessMealByTime() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "Kahvaltı";
  if (h >= 11 && h < 15) return "Öğle";
  if (h >= 17 && h < 23) return "Akşam";
  return "Atıştırmalık";
}

export default function Wizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    meal: guessMealByTime(),
    minCalories: 200,
    maxCalories: 800,
    cuisines: [],
    diet: "fark_etmez",
    hunger: "orta",
    budget: "fark_etmez",
    mood: [],
  });

  const canNext = () => {
    const s = STEPS[step].key;
    if (s === "meal") return !!form.meal;
    return true;
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else submit();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/recommend", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        setError("Giriş süren sona ermiş. Çıkış yapıp tekrar giriş yapın.");
        return;
      }
      if (!res.ok) throw new Error("Sunucu hatası");
      const data = await res.json();
      onComplete({ ...data, preferences: { ...form } });
    } catch (err) {
      setError(
        "Sunucuya ulaşılamadı. Backend çalışıyor mu? (localhost:4000)"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleArray = (key, value) => {
    setForm((f) => {
      const arr = f[key];
      return {
        ...f,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const progress = ((step + 1) / STEPS.length) * 100;
  const currentStep = STEPS[step];

  return (
    <section className="min-h-[calc(100vh-4rem)] animated-bg py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">
              Adım {step + 1} / {STEPS.length}
            </span>
            <span className="text-sm text-slate-500">
              %{Math.round(progress)} tamamlandı
            </span>
          </div>
          <div className="h-2 bg-white/60 rounded-full overflow-hidden backdrop-blur">
            <motion.div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="card p-8 md:p-12"
          >
            <div className="text-sm font-semibold text-brand-600 mb-2">
              {currentStep.subtitle}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              {currentStep.title}
            </h2>

            {currentStep.key === "meal" && (
              <>
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Saate göre "{form.meal}" önerildi
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {MEAL_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = form.meal === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setForm({ ...form, meal: opt.id })}
                        className={`p-6 rounded-2xl border-2 text-left transition-all ${
                          active
                            ? "border-brand-500 bg-gradient-to-br from-brand-50 to-orange-50 shadow-soft"
                            : "border-slate-200 bg-white hover:border-brand-300"
                        }`}
                      >
                        <Icon
                          className={`w-8 h-8 mb-3 ${
                            active ? "text-brand-600" : "text-slate-400"
                          }`}
                        />
                        <div className="font-bold text-lg">{opt.label}</div>
                        <div className="text-sm text-slate-500">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {currentStep.key === "calories" && (
              <div>
                <div className="text-center mb-8">
                  <div className="text-5xl font-extrabold text-brand-600">
                    {form.minCalories} – {form.maxCalories}
                  </div>
                  <div className="text-slate-500 mt-2">kalori aralığı</div>
                </div>
                <div className="space-y-6">
                  <Slider
                    label="Minimum"
                    value={form.minCalories}
                    min={100}
                    max={1500}
                    step={50}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        minCalories: Math.min(v, form.maxCalories - 100),
                      })
                    }
                  />
                  <Slider
                    label="Maksimum"
                    value={form.maxCalories}
                    min={200}
                    max={1500}
                    step={50}
                    onChange={(v) =>
                      setForm({
                        ...form,
                        maxCalories: Math.max(v, form.minCalories + 100),
                      })
                    }
                  />
                </div>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {[
                    [200, 400, "Hafif"],
                    [400, 700, "Dengeli"],
                    [700, 1000, "Doyurucu"],
                    [1000, 1500, "Kral Gibi"],
                  ].map(([lo, hi, label]) => (
                    <button
                      key={label}
                      onClick={() =>
                        setForm({
                          ...form,
                          minCalories: lo,
                          maxCalories: hi,
                        })
                      }
                      className="chip"
                    >
                      {label} ({lo}-{hi})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep.key === "cuisines" && (
              <div className="flex flex-wrap gap-3">
                {CUISINE_OPTIONS.map((c) => {
                  const active = form.cuisines.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleArray("cuisines", c)}
                      className={`chip ${active ? "chip-active" : ""}`}
                    >
                      {c}
                    </button>
                  );
                })}
                <p className="w-full text-sm text-slate-500 mt-4">
                  Hiçbirini seçmezsen tüm mutfaklar dahil olur.
                </p>
              </div>
            )}

            {currentStep.key === "diet" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIET_OPTIONS.map((d) => {
                  const active = form.diet === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setForm({ ...form, diet: d.id })}
                      className={`p-4 rounded-2xl border-2 font-semibold transition-all ${
                        active
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-white hover:border-brand-300"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep.key === "hunger" && (
              <div className="grid grid-cols-3 gap-4">
                {HUNGER_OPTIONS.map((h) => {
                  const active = form.hunger === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setForm({ ...form, hunger: h.id })}
                      className={`p-6 rounded-2xl border-2 text-center transition-all ${
                        active
                          ? "border-brand-500 bg-brand-50 shadow-soft"
                          : "border-slate-200 bg-white hover:border-brand-300"
                      }`}
                    >
                      <div className="text-4xl mb-2">{h.emoji}</div>
                      <div className="font-bold">{h.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{h.desc}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep.key === "budget" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BUDGET_OPTIONS.map((b) => {
                  const active = form.budget === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => setForm({ ...form, budget: b.id })}
                      className={`p-4 rounded-2xl border-2 font-semibold transition-all ${
                        active
                          ? "border-brand-500 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-white hover:border-brand-300"
                      }`}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            )}

            {currentStep.key === "mood" && (
              <div className="flex flex-wrap gap-3">
                {MOOD_OPTIONS.map((m) => {
                  const active = form.mood.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleArray("mood", m.id)}
                      className={`chip text-base py-3 px-5 ${
                        active ? "chip-active" : ""
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      {m.label}
                    </button>
                  );
                })}
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
              <button
                onClick={prev}
                disabled={step === 0}
                className="btn-ghost disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Geri
              </button>

              <button
                onClick={next}
                disabled={!canNext() || loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Hazırlanıyor...
                  </>
                ) : step === STEPS.length - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Öner Bana
                  </>
                ) : (
                  <>
                    İleri
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="text-sm font-bold text-brand-600">{value} kcal</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full bg-slate-200 appearance-none cursor-pointer accent-brand-500"
      />
    </div>
  );
}
