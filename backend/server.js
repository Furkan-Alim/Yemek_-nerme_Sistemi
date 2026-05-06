import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { rankFoodsForRecommend } from "../shared/scoring.mjs";
import { pool, testConnection } from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET =
  process.env.JWT_SECRET || "yemek-oneri-gelistirme-anahtari-degistir";
if (!process.env.JWT_SECRET) {
  console.warn(
    "[auth] JWT_SECRET .env içinde yok; geliştirme varsayılanı kullanılıyor. Üretimde mutlaka JWT_SECRET tanımlayın."
  );
}

const app = express();

const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  process.env.FRONTEND_URL ||
  ""
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  })
);
app.use(express.json({ limit: "1mb" }));

const foodsPath = path.resolve(__dirname, "../frontend/src/data/foods.json");
const FOODS = JSON.parse(fs.readFileSync(foodsPath, "utf-8"));

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Giriş yapmanız gerekiyor" });
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    const sub = payload.sub ?? payload.id;
    if (!sub) {
      return res.status(401).json({ error: "Oturum geçersiz" });
    }
    req.user = { id: Number(sub), email: payload.email };
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Oturum geçersiz veya süresi doldu" });
  }
}

async function ensureAuthSchema() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(120),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (e) {
    console.error("[auth] users tablosu:", e.message);
  }
}

function scoreAndRank(prefs) {
  return rankFoodsForRecommend(FOODS, prefs);
}

app.get("/api/health", async (req, res) => {
  const dbOk = await testConnection();
  res.json({ status: "ok", db: dbOk, foods: FOODS.length });
});

app.get("/api/foods", (req, res) => {
  res.json(FOODS);
});

// --- Auth ---
app.post("/api/auth/register", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    const name = String(req.body?.name || "").trim().slice(0, 120) || null;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Geçerli bir e-posta girin" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Şifre en az 6 karakter olmalı" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [email, hash, name]
    );
    const user = { id: result.rows[0].id, email, name };
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Bu e-posta zaten kayıtlı" });
    }
    console.error("[/api/auth/register]", err);
    res.status(500).json({ error: "Kayıt sırasında hata oluştu" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    const { rows } = await pool.query(
      "SELECT id, email, password_hash, name FROM users WHERE email = $1",
      [email]
    );
    if (!rows.length) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı" });
    }
    const u = rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "E-posta veya şifre hatalı" });
    }
    const token = jwt.sign(
      { sub: u.id, email: u.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      token,
      user: { id: u.id, email: u.email, name: u.name },
    });
  } catch (err) {
    console.error("[/api/auth/login]", err);
    res.status(500).json({ error: "Giriş sırasında hata oluştu" });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!rows.length) {
      return res.status(401).json({ error: "Kullanıcı bulunamadı" });
    }
    const u = rows[0];
    res.json({ user: { id: u.id, email: u.email, name: u.name } });
  } catch (err) {
    console.error("[/api/auth/me]", err);
    res.status(500).json({ error: "Kullanıcı okunamadı" });
  }
});

app.post("/api/recommend", requireAuth, async (req, res) => {
  try {
    const prefs = req.body || {};
    if (!prefs.meal) {
      return res.status(400).json({ error: "meal alanı zorunlu" });
    }

    const ranked = scoreAndRank(prefs);
    const sorted = ranked.slice(0, 12);

    let preferenceId = null;
    try {
      const ins = await pool.query(
        `INSERT INTO user_preferences
         (session_id, user_id, meal, min_calories, max_calories, cuisines, diet, hunger, budget, mood, user_ip, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10::jsonb, $11, $12)
         RETURNING id`,
        [
          prefs.sessionId || null,
          req.user.id,
          prefs.meal,
          prefs.minCalories ?? null,
          prefs.maxCalories ?? null,
          JSON.stringify(prefs.cuisines || []),
          prefs.diet || "fark_etmez",
          prefs.hunger || "orta",
          prefs.budget || "fark_etmez",
          JSON.stringify(prefs.mood || []),
          req.ip,
          (req.headers["user-agent"] || "").slice(0, 500),
        ]
      );
      preferenceId = ins.rows[0].id;

      if (sorted.length > 0) {
        for (const f of sorted) {
          await pool.query(
            `INSERT INTO recommendations (preference_id, food_id, food_name)
             VALUES ($1, $2, $3)`,
            [preferenceId, f.id, f.name]
          );
        }
      }
    } catch (dbErr) {
      console.warn("[db] Kayıt hatası (devam ediliyor):", dbErr.message);
    }

    res.json({
      preferenceId,
      total: sorted.length,
      results: sorted,
    });
  } catch (err) {
    console.error("[/api/recommend] hata:", err);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

app.post("/api/click", requireAuth, async (req, res) => {
  try {
    const { preferenceId, foodId } = req.body || {};
    if (!preferenceId || !foodId) {
      return res.status(400).json({ error: "preferenceId ve foodId gerekli" });
    }
    await pool.query(
      `UPDATE recommendations SET clicked = TRUE
       WHERE preference_id = $1 AND food_id = $2`,
      [preferenceId, foodId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.warn("[/api/click] hata:", err.message);
    res.json({ ok: false });
  }
});

app.get("/api/stats", requireAuth, async (req, res) => {
  try {
    const tp = await pool.query(
      "SELECT COUNT(*)::int AS c FROM user_preferences"
    );
    const tr = await pool.query(
      "SELECT COUNT(*)::int AS c FROM recommendations"
    );
    const tc = await pool.query(
      `SELECT COUNT(*)::int AS c FROM recommendations WHERE clicked = TRUE`
    );
    const totalPreferences = tp.rows[0].c;
    const totalRecommendations = tr.rows[0].c;
    const totalClicks = tc.rows[0].c;

    const popularRes = await pool.query(
      `SELECT food_name, COUNT(*)::int AS count
       FROM recommendations
       GROUP BY food_name
       ORDER BY count DESC
       LIMIT 10`
    );
    const popular = popularRes.rows;

    const clickedRes = await pool.query(
      `SELECT food_name, SUM(clicked::int)::int AS clicks
       FROM recommendations
       GROUP BY food_name
       HAVING SUM(clicked::int) > 0
       ORDER BY clicks DESC
       LIMIT 10`
    );
    const clicked = clickedRes.rows;

    const byMealRes = await pool.query(
      `SELECT meal, COUNT(*)::int AS count
       FROM user_preferences
       GROUP BY meal
       ORDER BY count DESC`
    );
    const byMeal = byMealRes.rows;

    const rawCuisinesRes = await pool.query(
      `SELECT cuisines FROM user_preferences WHERE cuisines IS NOT NULL`
    );
    const rawCuisines = rawCuisinesRes.rows;
    const cuisineCounts = {};
    for (const row of rawCuisines) {
      let arr = row.cuisines;
      try {
        if (typeof arr === "string") arr = JSON.parse(arr);
        else if (arr && typeof arr === "object" && !Array.isArray(arr)) arr = [];
      } catch {
        arr = [];
      }
      if (Array.isArray(arr)) {
        for (const c of arr) {
          cuisineCounts[c] = (cuisineCounts[c] || 0) + 1;
        }
      }
    }
    const byCuisine = Object.entries(cuisineCounts)
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const recentDaysRes = await pool.query(
      `SELECT created_at::date AS day, COUNT(*)::int AS count
       FROM user_preferences
       WHERE created_at >= (CURRENT_DATE - INTERVAL '6 days')
       GROUP BY created_at::date
       ORDER BY day ASC`
    );
    const recentDays = recentDaysRes.rows;

    res.json({
      totalPreferences,
      totalRecommendations,
      totalClicks,
      popular,
      clicked,
      byMeal,
      byCuisine,
      recentDays,
    });
  } catch (err) {
    console.error("[/api/stats] hata:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await ensureAuthSchema();
  console.log(`[server] http://localhost:${PORT} üzerinde çalışıyor`);
  await testConnection();
});
