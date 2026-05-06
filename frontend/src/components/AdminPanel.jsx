import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Users,
  MousePointerClick,
  Flame,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { apiFetch } from "../utils/api.js";

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/stats");
      if (res.status === 401) {
        setError("Bu sayfa için giriş yapmanız gerekiyor.");
        return;
      }
      if (!res.ok) throw new Error("stats");
      const data = await res.json();
      setStats(data);
    } catch {
      setError("İstatistikler yüklenemedi. Backend çalışıyor mu?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span>İstatistikler yükleniyor...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Hata</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <button onClick={load} className="btn-primary">
            <RefreshCw className="w-4 h-4" />
            Tekrar Dene
          </button>
        </div>
      </section>
    );
  }

  const {
    totalPreferences = 0,
    totalRecommendations = 0,
    totalClicks = 0,
    popular = [],
    clicked = [],
    byMeal = [],
    byCuisine = [],
    recentDays = [],
  } = stats || {};

  const clickRate =
    totalRecommendations > 0
      ? Math.round((totalClicks / totalRecommendations) * 100)
      : 0;

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-sm font-semibold text-brand-600 mb-1">
              Dashboard
            </div>
            <h1 className="text-4xl font-extrabold flex items-center gap-3">
              <BarChart3 className="w-9 h-9 text-brand-500" />
              İstatistikler
            </h1>
            <p className="text-slate-500 mt-2">
              MySQL'den canlı veri — site kullanım analitiği
            </p>
          </div>
          <button onClick={load} className="btn-ghost border border-slate-200">
            <RefreshCw className="w-4 h-4" />
            Yenile
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Toplam İstek"
            value={totalPreferences}
            color="from-blue-500 to-indigo-600"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Önerilen Yemek"
            value={totalRecommendations}
            color="from-brand-500 to-red-500"
          />
          <StatCard
            icon={<MousePointerClick className="w-5 h-5" />}
            label="Toplam Tıklama"
            value={totalClicks}
            color="from-emerald-500 to-teal-600"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Tıklama Oranı"
            value={`%${clickRate}`}
            color="from-purple-500 to-fuchsia-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="En Çok Önerilen 10 Yemek" subtitle="Hangi yemekler en sık öneriliyor">
            {popular.length === 0 ? (
              <EmptyText />
            ) : (
              <BarList items={popular} valueKey="count" nameKey="food_name" />
            )}
          </Card>

          <Card title="En Çok Tıklanan Yemekler" subtitle="Sipariş için tıklananlar">
            {clicked.length === 0 ? (
              <EmptyText text="Henüz kimse sipariş için tıklamadı" />
            ) : (
              <BarList
                items={clicked}
                valueKey="clicks"
                nameKey="food_name"
                color="emerald"
              />
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="Öğün Dağılımı" subtitle="Hangi öğün için istek geliyor">
            {byMeal.length === 0 ? (
              <EmptyText />
            ) : (
              <BarList items={byMeal} valueKey="count" nameKey="meal" color="blue" />
            )}
          </Card>

          <Card title="Favori Mutfaklar" subtitle="En çok seçilen mutfaklar">
            {byCuisine.length === 0 ? (
              <EmptyText />
            ) : (
              <BarList
                items={byCuisine}
                valueKey="count"
                nameKey="cuisine"
                color="purple"
              />
            )}
          </Card>
        </div>

        {recentDays.length > 0 && (
          <Card title="Son 7 Gün Aktivite" subtitle="Günlük form doldurma sayısı">
            <DailyChart data={recentDays} />
          </Card>
        )}
      </div>
    </section>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div
        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white flex items-center justify-center mb-3 shadow-soft`}
      >
        {icon}
      </div>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
    </motion.div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="font-bold text-lg">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function EmptyText({ text = "Henüz veri yok" }) {
  return <div className="text-sm text-slate-400 py-8 text-center">{text}</div>;
}

const COLOR_MAP = {
  brand: "from-brand-400 to-brand-600",
  emerald: "from-emerald-400 to-emerald-600",
  blue: "from-blue-400 to-blue-600",
  purple: "from-purple-400 to-purple-600",
};

function BarList({ items, valueKey, nameKey, color = "brand" }) {
  const max = Math.max(...items.map((x) => Number(x[valueKey]) || 0), 1);
  return (
    <div className="space-y-2.5">
      {items.map((it, idx) => {
        const v = Number(it[valueKey]) || 0;
        const pct = (v / max) * 100;
        return (
          <motion.div
            key={`${it[nameKey]}-${idx}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="group"
          >
            <div className="flex items-center justify-between mb-1 text-sm">
              <span className="font-medium text-slate-700 truncate flex-1">
                {idx + 1}. {it[nameKey]}
              </span>
              <span className="font-bold text-slate-900 ml-2">{v}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.04 }}
                className={`h-full bg-gradient-to-r ${COLOR_MAP[color]} rounded-full`}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function DailyChart({ data }) {
  const max = Math.max(...data.map((d) => Number(d.count) || 0), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-40 pt-4">
      {data.map((d, i) => {
        const h = ((Number(d.count) || 0) / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div className="text-xs font-bold text-slate-600">{d.count}</div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="w-full bg-gradient-to-t from-brand-500 to-brand-300 rounded-t-lg min-h-[4px]"
            />
            <div className="text-[10px] text-slate-400 font-medium">
              {formatDate(d.day)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatDate(d) {
  try {
    const date = new Date(d);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  } catch {
    return d;
  }
}
