/**
 * foods.json: platformSearchName türetir (görsel yolu assign-image-slugs.mjs ile).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foodsPath = path.resolve(__dirname, "../src/data/foods.json");

const GENERIC_SECOND = new Set(["kebap", "kebab"]);

function capitalizeTr(s) {
  if (!s) return "";
  const lower = s.toLocaleLowerCase("tr");
  const first = lower.charAt(0).toLocaleUpperCase("tr");
  return first + lower.slice(1);
}

function wordsFromQuery(q) {
  return String(q || "")
    .trim()
    .toLocaleLowerCase("tr")
    .split(/\s+/)
    .filter(Boolean);
}

function derivePlatformSearchName(f) {
  const parts = wordsFromQuery(f.yemeksepeti_query);
  if (parts.length === 0) return f.name.trim();
  if (parts.length === 1) return capitalizeTr(parts[0]);
  if (parts.length === 2 && GENERIC_SECOND.has(parts[1])) {
    return capitalizeTr(parts[0]);
  }
  if (parts.length >= 3) {
    return `${capitalizeTr(parts[0])} ${capitalizeTr(parts[1])}`;
  }
  return parts.map((w) => capitalizeTr(w)).join(" ");
}

const raw = JSON.parse(fs.readFileSync(foodsPath, "utf8"));
for (const f of raw) {
  f.platformSearchName = derivePlatformSearchName(f);
  delete f.image;
}
fs.writeFileSync(foodsPath, JSON.stringify(raw, null, 2) + "\n", "utf8");
console.log("[augment-foods] tamam:", raw.length, "kayıt");
