/**
 * public/images/foods/{slug}.jpg veya .png doldurur.
 * Kaynak: en/tr Wikipedia REST summary (Vikipedi makalesi görseli; rastgele Unsplash yok).
 * Mevcut geçerli görsel dosyası varsa atlanır; bitince foods.json imageUrl uzantıları güncellenir.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DIRECT_IMAGE_URLS } from "./food-image-direct-urls.mjs";
import { EXTRA_TITLES_BY_SLUG } from "./wiki-image-overrides.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foodsPath = path.resolve(__dirname, "../src/data/foods.json");
const outDir = path.resolve(__dirname, "../public/images/foods");

const UA =
  "YemekOneriSistemi/1.0 (https://github.com/; Wikipedia REST thumbnail for local UI preview)";

function titleCandidates(name, platformSearchName, slug) {
  const toUnd = (s) => String(s || "").trim().replace(/\s+/g, "_");
  const c = [];
  for (const t of EXTRA_TITLES_BY_SLUG[slug] || []) {
    if (t) c.push(t);
  }
  const p = toUnd(platformSearchName);
  const n = toUnd(name);
  if (p) {
    c.push(p);
    c.push(`${p}_(food)`);
  }
  if (n && n !== p) {
    c.push(n);
    c.push(`${n}_(food)`);
  }
  const slugPart = String(slug || "")
    .replace(/-\d+$/, "")
    .split("-")
    .filter((w) => w.length > 0 && !/^\d+$/.test(w))
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("_");
  if (slugPart) {
    c.push(slugPart);
    c.push(`${slugPart}_(food)`);
  }
  const out = [];
  const seen = new Set();
  for (const t of c) {
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out.slice(0, 8);
}

function upscaleThumb(url) {
  if (!url || typeof url !== "string") return null;
  return url.replace(/\/\d+px-/, "/800px-");
}

async function restSummary(lang, title) {
  const base = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/`;
  const url = base + encodeURIComponent(title);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${lang} ${res.status} ${title}`);
  return res.json();
}

function imageUrlVariants(data) {
  const orig = data.originalimage?.source;
  const th = data.thumbnail?.source;
  const list = [];
  if (th) {
    list.push(upscaleThumb(th));
    list.push(th);
  }
  if (orig) list.push(orig);
  const out = [];
  const seen = new Set();
  for (const u of list) {
    if (!u || /\.(svg|gif)(\?|$)/i.test(u) || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

async function pickImageUrlList(name, platformSearchName, slug) {
  const titles = titleCandidates(name, platformSearchName, slug);
  const langs = /[ğüşıöçĞÜŞİÖÇİı]/.test(name) ? ["tr", "en"] : ["en", "tr"];
  for (const title of titles) {
    for (const lang of langs) {
      let data;
      try {
        data = await restSummary(lang, title);
      } catch {
        continue;
      }
      if (!data || data.type === "disambiguation") continue;
      const urls = imageUrlVariants(data);
      if (urls.length) return urls;
    }
  }
  return [];
}

async function downloadBytes(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`GET ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

/** Doğrudan URL listesinden geçerli raster görsel bulur. */
async function tryDownloadFromUrlList(urls) {
  for (const imgUrl of urls) {
    let b;
    try {
      b = await downloadBytes(imgUrl);
    } catch {
      continue;
    }
    let k = imageKind(b);
    if (!k) {
      const th = imgUrl.replace(/\/\d+px-/, "/330px-");
      if (th !== imgUrl) {
        try {
          b = await downloadBytes(th);
          k = imageKind(b);
        } catch {
          /* next url */
        }
      }
    }
    if (k && b && b.length >= 4000) return { bytes: b, kind: k };
  }
  return null;
}

function isJpeg(buf) {
  return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

function isPng(buf) {
  return (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  );
}

function isWebp(buf) {
  return (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  );
}

function imageKind(buf) {
  if (isJpeg(buf)) return "jpg";
  if (isPng(buf)) return "png";
  if (isWebp(buf)) return "webp";
  return null;
}

function hasValidLocalImage(slug) {
  for (const ext of ["jpg", "png", "webp"]) {
    const dest = path.join(outDir, `${slug}.${ext}`);
    if (!fs.existsSync(dest)) continue;
    const st = fs.statSync(dest);
    if (st.size < 4000) {
      fs.unlinkSync(dest);
      continue;
    }
    const head = Buffer.alloc(16);
    const fd = fs.openSync(dest, "r");
    fs.readSync(fd, head, 0, 16, 0);
    fs.closeSync(fd);
    const k = imageKind(head);
    if (k === ext) return true;
    fs.unlinkSync(dest);
  }
  return false;
}

function syncFoodsJsonImageUrlsFromDisk() {
  const raw = JSON.parse(fs.readFileSync(foodsPath, "utf8"));
  const extBySlug = new Map();
  for (const f of fs.readdirSync(outDir)) {
    const m = /^(.+)\.(jpe?g|png|webp)$/i.exec(f);
    if (!m) continue;
    const slug = m[1];
    const extRaw = m[2].toLowerCase();
    const ext =
      extRaw === "png"
        ? "png"
        : extRaw === "webp"
          ? "webp"
          : "jpg";
    extBySlug.set(slug, ext);
  }
  let n = 0;
  for (const row of raw) {
    const s = row.imageSlug;
    if (!s) continue;
    const e = extBySlug.get(s);
    if (!e) continue;
    const next = `/images/foods/${s}.${e}`;
    if (row.imageUrl !== next) n++;
    row.imageUrl = next;
  }
  fs.writeFileSync(foodsPath, JSON.stringify(raw, null, 2) + "\n", "utf8");
  if (n) console.log(`[wiki] foods.json imageUrl senkron (${n} satır güncellendi)`);
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(foodsPath, "utf8"));
  const bySlug = new Map();
  for (const f of raw) {
    const s = f.imageSlug;
    if (!s || bySlug.has(s)) continue;
    bySlug.set(s, {
      name: f.name,
      platformSearchName: f.platformSearchName || "",
    });
  }
  const list = [...bySlug.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  fs.mkdirSync(outDir, { recursive: true });

  let ok = 0;
  let skip = 0;
  let fail = 0;

  const forceDirectSlugs = new Set(Object.keys(DIRECT_IMAGE_URLS));

  for (const [slug, { name, platformSearchName }] of list) {
    const purgeStale = () => {
      for (const ext of ["jpg", "png", "webp"]) {
        const alt = path.join(outDir, `${slug}.${ext}`);
        if (fs.existsSync(alt)) fs.unlinkSync(alt);
      }
    };

    if (forceDirectSlugs.has(slug)) {
      purgeStale();
      process.stdout.write(`[direct] ${slug} … `);
      try {
        const direct = await tryDownloadFromUrlList(DIRECT_IMAGE_URLS[slug]);
        if (direct) {
          const dest = path.join(outDir, `${slug}.${direct.kind}`);
          fs.writeFileSync(dest, direct.bytes);
          console.log(`tamam (.${direct.kind})`);
          ok++;
          await sleep(200);
          continue;
        }
        console.log("doğrudan indirilemedi, wiki deneniyor");
      } catch (e) {
        console.log(`hata: ${e.message}`);
      }
    } else if (hasValidLocalImage(slug)) {
      skip++;
      continue;
    }

    purgeStale();

    process.stdout.write(`[wiki] ${slug} … `);
    try {
      const urls = await pickImageUrlList(name, platformSearchName, slug);
      if (!urls.length) {
        console.log("yok");
        fail++;
        await sleep(350);
        continue;
      }
      const got = await tryDownloadFromUrlList(urls);
      if (!got) {
        console.log("geçersiz görsel");
        fail++;
        await sleep(350);
        continue;
      }
      const dest = path.join(outDir, `${slug}.${got.kind}`);
      fs.writeFileSync(dest, got.bytes);
      console.log(`tamam (.${got.kind})`);
      ok++;
    } catch (e) {
      console.log(`hata: ${e.message}`);
      fail++;
    }
    await sleep(450);
  }
  syncFoodsJsonImageUrlsFromDisk();
  console.log(`[wiki] bitti: yeni=${ok}, atlandi=${skip}, basarisiz=${fail}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
