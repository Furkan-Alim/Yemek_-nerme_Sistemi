/**
 * foods.json içindeki uzak CDN görsellerini indirip `public/foods/{id}.{ext}`
 * olarak yazar ve `image` alanını `/foods/...` yerel URL'ye günceller.
 * Tekrar çalıştığında yerel görsel olan kayıtlar atlanır.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const foodsPath = path.join(root, "src", "data", "foods.json");
const outDir = path.join(root, "public", "foods");

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

function refererFor(url) {
  try {
    const h = new URL(url).hostname;
    if (h.includes("unsplash")) return "https://unsplash.com/";
    if (h.includes("pexels")) return "https://www.pexels.com/";
  } catch {
    /* noop */
  }
  return "";
}

function extFromCt(ct) {
  if (!ct) return ".jpg";
  const c = ct.toLowerCase();
  if (c.includes("png")) return ".png";
  if (c.includes("webp")) return ".webp";
  return ".jpg";
}

async function tryFetch(url) {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), 42000);
  try {
    const rf = refererFor(url);
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/jpeg,image/png,*/*;q=0.8",
        "User-Agent": UA,
        ...(rf ? { Referer: rf } : {}),
      },
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 400) return null;
    const ct = res.headers.get("content-type") || "";
    return { buf, ct };
  } catch {
    return null;
  } finally {
    clearTimeout(to);
  }
}

await fs.promises.mkdir(outDir, { recursive: true });

const raw = await fs.promises.readFile(foodsPath, "utf8");
const foods = JSON.parse(raw);

let updated = 0;
let skipped = 0;

for (const food of foods) {
  const id = food.id;
  if (id == null) continue;

  if (typeof food.image === "string" && food.image.startsWith("/foods/")) {
    skipped++;
    continue;
  }

  const urls = [];
  if (food.image?.startsWith("http")) urls.push(food.image);
  if (food.image_alt?.startsWith("http")) urls.push(food.image_alt);

  let data = null;
  for (const u of urls) {
    process.stdout.write(`[fetch] ${id} …\r`);
    data = await tryFetch(u);
    if (data) break;
    await new Promise((r) => setTimeout(r, 100));
  }

  if (!data) {
    console.warn(`[fail ] id=${id} — uzak adresler kullanılacak`);
    continue;
  }

  const ext = extFromCt(data.ct);
  const fname = `${id}${ext}`;
  await fs.promises.writeFile(path.join(outDir, fname), data.buf);
  food.image = `/foods/${fname}`;
  updated++;
  await new Promise((r) => setTimeout(r, 60));
}

await fs.promises.writeFile(
  foodsPath,
  `${JSON.stringify(foods, null, 2)}\n`,
  "utf8"
);

console.log(
  `\nTamam: ${updated} görsel yerel olarak kaydedildi, ${skipped} zaten yerel.`,
);
