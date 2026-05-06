/** Ham JSON (foods.json) */
export interface RawFoodRecord {
  id: number;
  name: string;
  description: string;
  calories: number;
  cuisine: string;
  meal: string[];
  diet: string[];
  mood: string[];
  budget: string;
  portion: string;
  yemeksepeti_query: string;
  platformSearchName?: string;
  imageUrl: string | null;
  imageAlt?: string;
  /** Dosya adı kökü; `imageUrl` ile aynı yemek adı kayıtlarında ortak. */
  imageSlug?: string;
  matchScore?: number;
  matchPercent?: number;
  matchExplanation?: string;
}

export interface UserPreferences {
  meal: string;
  minCalories: number;
  maxCalories: number;
  cuisines: string[];
  diet: string;
  hunger: string;
  budget: string;
  mood: string[];
}

export interface Food {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  calories: number;
  tags: string[];
  dietType: string;
  budgetLevel: string;
  hungerLevel: string;
  imageUrl: string | null;
  imageAlt: string;
  platformSearchName: string;
  searchKeywords: string[];
  meal: string[];
  mood: string[];
  budget: string;
  portion: string;
  diet: string[];
  yemeksepeti_query: string;
}

export type RankedFood = Food & {
  matchScore: number;
  matchPercent: number;
  matchExplanation: string;
};
