import { UtensilsCrossed } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/50 backdrop-blur py-6 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-700">Ne Yesem?</span>
        </div>
        <div>© {new Date().getFullYear()} — Akıllı Yemek Öneri Sistemi</div>
      </div>
    </footer>
  );
}
