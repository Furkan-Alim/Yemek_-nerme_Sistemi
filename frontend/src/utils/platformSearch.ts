import type { Food, UserPreferences } from "../types/food";

const YS_TEMPLATE = import.meta.env.VITE_YEMEKSEPETI_SEARCH_URL?.trim();

/** Yemeksepeti adres çubuğundaki gibi: boşluklar + ile (ör. et+döner). */
function encodeYemeksepetiQueryValue(text: string): string {
  return encodeURIComponent(text.trim()).replace(/%20/g, "+");
}

/** Platform arama kutusu: yalnızca kısa yemek adı (filtre kelimeleri yok). */
export function platformDishSearchText(food: Food): string {
  const s = (food.platformSearchName || food.name || "").trim();
  return s || "Yemek";
}

/**
 * URL ve pano için tek metin — kullanıcı tercihleri burada kullanılmaz.
 * (Harici sitelerde kalori/diyet URL ile güvenilir şekilde uygulanamadığından.)
 */
export function buildPlatformSearchQuery(food: Food): string {
  return platformDishSearchText(food);
}

function amplifySearch(qEnc: string, extraKeys: string[] = []): string {
  const keys = [
    "q",
    "search",
    "searchText",
    "searchQuery",
    "search_term",
    "searchTerm",
    "query",
    "keyword",
    "keywords",
    "text",
    "term",
    ...extraKeys,
  ];
  const uniq = [...new Set(keys)];
  return uniq.map((k) => `${encodeURIComponent(k)}=${qEnc}`).join("&");
}

/**
 * @param _prefs — ileride resmi URL parametreleri için; arama metnine eklenmez.
 * Varsayılan: ?expedition=delivery&vertical=restaurants&query=...
 */
export function buildYemeksepetiUrl(
  food: Food,
  _prefs?: UserPreferences | null,
  _coords?: { lat: number; lng: number } | null
): string {
  const plain = platformDishSearchText(food);
  const q = encodeYemeksepetiQueryValue(plain);
  if (YS_TEMPLATE?.includes("{q}")) {
    return YS_TEMPLATE.replaceAll("{q}", q);
  }
  return `https://www.yemeksepeti.com/?expedition=delivery&vertical=restaurants&query=${q}`;
}

export function buildGetirUrl(food: Food, _prefs?: UserPreferences | null): string {
  const qEnc = encodeURIComponent(platformDishSearchText(food));
  return `https://getir.com/yemek?search=${qEnc}&q=${qEnc}`;
}

export function buildTrendyolGoUrl(
  food: Food,
  _prefs?: UserPreferences | null
): string {
  const qEnc = encodeURIComponent(platformDishSearchText(food));
  return `https://tgoyemek.com/arama?ref=trendyol&${amplifySearch(qEnc)}`;
}

export function briefFilterSummary(prefs: UserPreferences | null): string | null {
  if (!prefs) return null;
  const parts: string[] = [];
  if (prefs.meal) parts.push(prefs.meal);
  const lo = Number(prefs.minCalories);
  const hi = Number(prefs.maxCalories);
  if (!Number.isNaN(lo) && !Number.isNaN(hi)) parts.push(`${lo}–${hi} kcal`);
  if (prefs.cuisines?.length) parts.push(prefs.cuisines.join(", "));
  else parts.push("Tüm mutfaklar");
  const dietLabels: Record<string, string> = {
    fark_etmez: "Diyet fark etmez",
    vejetaryen: "Vejetaryen",
    vegan: "Vegan",
    glutensiz: "Glutensiz",
  };
  parts.push(dietLabels[prefs.diet] || prefs.diet);
  const hungerLabels: Record<string, string> = {
    hafif: "Hafif açlık",
    orta: "Orta açlık",
    cok_ac: "Çok aç",
  };
  parts.push(hungerLabels[prefs.hunger] || prefs.hunger);
  const budgetLabels: Record<string, string> = {
    fark_etmez: "Bütçe fark etmez",
    ucuz: "Ekonomik",
    orta: "Orta bütçe",
    premium: "Premium",
  };
  parts.push(budgetLabels[prefs.budget] || prefs.budget);
  if (prefs.mood?.length) {
    parts.push(
      prefs.mood
        .map(
          (m) =>
            ({
              tatlı: "Tatlı",
              tuzlu: "Tuzlu",
              baharatlı: "Baharatlı",
              yağlı: "Yağlı / Doyurucu",
              ferahlatıcı: "Ferahlatıcı",
            }[m] || m)
        )
        .join(", ")
    );
  }
  return parts.join(" · ");
}
