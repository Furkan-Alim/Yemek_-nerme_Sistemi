/**
 * foods.json: imageSlug + imageUrl + imageAlt.
 * Çakışan slug'larda: {base}-{id}.jpg
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foodsPath = path.resolve(__dirname, "../src/data/foods.json");

const SLUG_BY_ID = {
  1: "adana-kebap",
  2: "urfa-kebap",
  3: "iskender",
  4: "lahmacun",
  5: "kiymali-pide",
  6: "kayseri-mantisi",
  7: "izgara-kofte",
  8: "tavuk-durum",
  9: "et-doner",
  17: "kumpir",
  26: "cheeseburger",
  59: "sezar-salata",
};

function slugifyName(name) {
  const lower = String(name || "yemek").toLocaleLowerCase("tr");
  const map = {
    ı: "i",
    ğ: "g",
    ü: "u",
    ş: "s",
    ö: "o",
    ç: "c",
    â: "a",
    î: "i",
    û: "u",
  };
  let x = lower;
  for (const [tr, en] of Object.entries(map)) {
    x = x.split(tr).join(en);
  }
  const s = x
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "yemek";
}

const raw = JSON.parse(fs.readFileSync(foodsPath, "utf8"));

/** Aynı `name` → aynı görsel dosyası (en küçük id temsilci). */
const nameKey = (name) => String(name || "").trim();
const nameToCanonicalId = new Map();
for (const f of raw) {
  const k = nameKey(f.name);
  const prev = nameToCanonicalId.get(k);
  if (prev == null || f.id < prev) nameToCanonicalId.set(k, f.id);
}

const sortedCanon = [...new Set(nameToCanonicalId.values())].sort(
  (a, b) => a - b
);
const usedSlugs = new Set();
const canonIdToSlug = new Map();

for (const cid of sortedCanon) {
  const row = raw.find((x) => x.id === cid);
  let base = SLUG_BY_ID[cid] ?? slugifyName(row?.name ?? "");
  let slug = base;
  if (usedSlugs.has(slug)) {
    slug = `${base}-${cid}`;
  }
  usedSlugs.add(slug);
  canonIdToSlug.set(cid, slug);
}

for (const f of raw) {
  const canonId = nameToCanonicalId.get(nameKey(f.name));
  const slug = canonIdToSlug.get(canonId);
  f.imageSlug = slug;
  f.imageUrl = `/images/foods/${slug}.jpg`;
  if (!f.imageAlt || String(f.imageAlt).trim() === "") {
    f.imageAlt = `${f.name} — görsel`;
  }
}

fs.writeFileSync(foodsPath, JSON.stringify(raw, null, 2) + "\n", "utf8");
console.log("[assign-image-slugs] tamam:", raw.length);
