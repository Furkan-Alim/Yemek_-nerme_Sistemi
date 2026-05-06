import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  Heart,
  BarChart3,
  Home,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";

export default function Header({
  stage,
  onNavigate,
  favoriteCount = 0,
  user,
  onLoginClick,
  onRegisterClick,
  onLogout,
}) {
  const items = [
    { id: "hero", label: "Ana Sayfa", icon: Home },
    { id: "favorites", label: "Favorilerim", icon: Heart, badge: favoriteCount },
    { id: "admin", label: "İstatistikler", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => onNavigate("hero")}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg hidden sm:inline">
            Ne <span className="text-brand-600">Yesem?</span>
          </span>
        </button>

        <nav className="flex items-center gap-1 flex-1 justify-end min-w-0">
          {items.map((item) => {
            const Icon = item.icon;
            const active = stage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline truncate">{item.label}</span>
                {item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </button>
            );
          })}

          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block shrink-0" />

          {user ? (
            <div className="flex items-center gap-2 pl-1 min-w-0">
              <span
                className="hidden md:inline text-xs text-slate-500 max-w-[140px] truncate"
                title={user.email}
              >
                {user.email}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Çıkış</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onLoginClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Giriş</span>
              </button>
              <button
                type="button"
                onClick={onRegisterClick}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Kayıt</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
