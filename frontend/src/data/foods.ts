import type { RawFoodRecord, Food, RankedFood } from "../types/food";
import rawList from "./foods.json";

function portionToHungerLabel(portion: string): string {
  if (portion === "küçük") return "hafif";
  if (portion === "büyük") return "cok_ac";
  return "orta";
}

function primaryDietType(diet: string[]): string {
  if (!diet?.length) return "genel";
  return diet[0];
}

export function normalizeFood(raw: RawFoodRecord): Food {
  const kw = [raw.platformSearchName, raw.yemeksepeti_query, raw.name].filter(
    Boolean
  ) as string[];
  const imageUrl =
    typeof raw.imageUrl === "string" && raw.imageUrl.trim()
      ? raw.imageUrl.trim()
      : null;
  const tags = [...(raw.mood || [])] as string[];

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    cuisine: raw.cuisine,
    calories: raw.calories,
    tags,
    dietType: primaryDietType(raw.diet || []),
    budgetLevel: raw.budget,
    hungerLevel: portionToHungerLabel(raw.portion || "orta"),
    imageUrl,
    imageAlt: raw.imageAlt || raw.name,
    platformSearchName: (raw.platformSearchName || raw.name).trim(),
    searchKeywords: kw,
    meal: raw.meal || [],
    mood: raw.mood || [],
    budget: raw.budget,
    portion: raw.portion,
    diet: raw.diet || [],
    yemeksepeti_query: raw.yemeksepeti_query,
  };
}

export function normalizeRanked(
  raw: RawFoodRecord & {
    matchScore?: number;
    matchPercent?: number;
    matchExplanation?: string;
  }
): RankedFood {
  const base = normalizeFood(raw);
  return {
    ...base,
    matchScore: raw.matchScore ?? 0,
    matchPercent: raw.matchPercent ?? 0,
    matchExplanation: raw.matchExplanation ?? "",
  };
}

export function asRankedFood(
  raw: RawFoodRecord & {
    matchScore?: number;
    matchPercent?: number;
    matchExplanation?: string;
  }
): RankedFood {
  if (
    typeof raw.matchPercent === "number" &&
    raw.matchExplanation &&
    typeof raw.matchScore === "number"
  ) {
    return normalizeRanked(raw);
  }
  return normalizeRanked({
    ...raw,
    matchScore: 0,
    matchPercent: 0,
    matchExplanation: "Bu yemek favorilerinden veya çarktan seçildi.",
  });
}

const raw = rawList as RawFoodRecord[];

export const FOODS: Food[] = raw.map(normalizeFood);

export function getFoodsNormalized(): Food[] {
  return raw.map(normalizeFood);
}
