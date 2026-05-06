/**
 * Öneri skoru — frontend (recommendation.ts) ile aynı mantık.
 * Toplam 110 puan → yüzdeye çevrilir.
 */

const MAX_POINTS = 110;

function inCalorieRange(food, prefs) {
  const lo = Number(prefs.minCalories);
  const hi = Number(prefs.maxCalories);
  if (Number.isNaN(lo) || Number.isNaN(hi)) return false;
  return food.calories >= lo && food.calories <= hi;
}

/** Liste filtresi: aralık yoksa kaloriyle kesme. */
function calorieFilterOk(food, prefs) {
  const lo = Number(prefs.minCalories);
  const hi = Number(prefs.maxCalories);
  if (Number.isNaN(lo) || Number.isNaN(hi)) return true;
  return food.calories >= lo && food.calories <= hi;
}

function dietMatches(food, prefs) {
  if (!prefs.diet || prefs.diet === "fark_etmez") return true;
  const d = Array.isArray(food.diet) ? food.diet : [];
  return d.includes(prefs.diet);
}

function hungerPoints(food, prefs) {
  const h = prefs.hunger || "orta";
  const p = food.portion || "orta";
  if (h === "hafif") {
    if (p === "küçük") return 15;
    if (p === "orta") return 10;
    return 0;
  }
  if (h === "cok_ac") {
    if (p === "büyük") return 15;
    if (p === "orta") return 10;
    return 5;
  }
  if (p === "orta") return 15;
  if (p === "küçük") return 10;
  if (p === "büyük") return 10;
  return 8;
}

function budgetPoints(food, prefs) {
  if (!prefs.budget || prefs.budget === "fark_etmez") return 10;
  return food.budget === prefs.budget ? 10 : 0;
}

function moodPoints(food, prefs) {
  const want = Array.isArray(prefs.mood) ? prefs.mood : [];
  const fm = Array.isArray(food.mood) ? food.mood : [];
  if (!want.length) return 15;
  let n = 0;
  for (const m of want) {
    if (fm.includes(m)) n++;
  }
  if (n === 0) return 0;
  return Math.min(15, n * 8);
}

function cuisinePoints(food, prefs) {
  const c = Array.isArray(prefs.cuisines) ? prefs.cuisines : [];
  if (!c.length) return 20;
  return c.includes(food.cuisine) ? 20 : 0;
}

function caloriePoints(food, prefs) {
  return inCalorieRange(food, prefs) ? 30 : 0;
}

function dietRestrictionPoints(food, prefs) {
  if (!prefs.diet || prefs.diet === "fark_etmez") return 20;
  return dietMatches(food, prefs) ? 20 : 0;
}

export function computeMatchDetails(food, prefs) {
  const c = caloriePoints(food, prefs);
  const cu = cuisinePoints(food, prefs);
  const di = dietRestrictionPoints(food, prefs);
  const hu = hungerPoints(food, prefs);
  const bu = budgetPoints(food, prefs);
  const mo = moodPoints(food, prefs);
  const total = c + cu + di + hu + bu + mo;
  const percent = Math.min(100, Math.round((total / MAX_POINTS) * 100));

  const parts = [];
  if (prefs.meal && Array.isArray(food.meal) && food.meal.includes(prefs.meal)) {
    parts.push(`${prefs.meal} öğünü için uygun`);
  }
  parts.push(`${food.calories} kcal civarında`);
  if (inCalorieRange(food, prefs)) parts.push("belirlediğin kalori aralığına giriyor");
  if (Array.isArray(prefs.cuisines) && prefs.cuisines.length) {
    if (prefs.cuisines.includes(food.cuisine)) {
      parts.push(`${food.cuisine} mutfağı tercihinle örtüşüyor`);
    }
  } else {
    parts.push(`${food.cuisine} mutfağından`);
  }
  if (prefs.diet && prefs.diet !== "fark_etmez" && dietMatches(food, prefs)) {
    parts.push("diyet kısıtına uygun");
  }
  if (Array.isArray(prefs.mood) && prefs.mood.length) {
    const hit = prefs.mood.filter((m) => (food.mood || []).includes(m));
    if (hit.length) parts.push(`tat profilinde (${hit.join(", ")}) eşleşme var`);
  }
  const explanation =
    parts.length > 0
      ? `Bu yemek ${parts.join(", ")}.`
      : "Seçimlerine göre listelenen bir öneri.";

  return {
    total,
    percent,
    explanation,
    breakdown: { calories: c, cuisine: cu, diet: di, hunger: hu, budget: bu, mood: mo },
  };
}

export function filterCandidates(foods, prefs) {
  const meal = prefs.meal;
  const diet = prefs.diet || "fark_etmez";
  const cuisines = Array.isArray(prefs.cuisines) ? prefs.cuisines : [];

  return foods.filter((f) => {
    if (meal && Array.isArray(f.meal) && !f.meal.includes(meal)) return false;
    if (!calorieFilterOk(f, prefs)) return false;
    if (diet !== "fark_etmez") {
      const fd = Array.isArray(f.diet) ? f.diet : [];
      if (!fd.includes(diet)) return false;
    }
    if (cuisines.length > 0 && !cuisines.includes(f.cuisine)) return false;
    return true;
  });
}

/**
 * @returns {Array<object>} food + matchPercent + matchExplanation + matchScore
 */
export function rankFoodsForRecommend(foods, prefs) {
  const candidates = filterCandidates(foods, prefs);
  return candidates
    .map((food) => {
      const d = computeMatchDetails(food, prefs);
      return {
        ...food,
        matchScore: d.total,
        matchPercent: d.percent,
        matchExplanation: d.explanation,
      };
    })
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return a.calories - b.calories;
    });
}
