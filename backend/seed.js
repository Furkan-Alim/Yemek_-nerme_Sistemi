import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foodsPath = path.resolve(__dirname, "../frontend/src/data/foods.json");
const foods = JSON.parse(fs.readFileSync(foodsPath, "utf-8"));

async function seed() {
  console.log(`[seed] ${foods.length} yemek PostgreSQL'e yazılacak...`);
  try {
    await pool.query("TRUNCATE TABLE foods");
    for (const f of foods) {
      await pool.query(
        `INSERT INTO foods
         (id, name, description, image, image_alt, platform_search_name, calories, cuisine, meal, diet, mood, budget, portion, yemeksepeti_query)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12, $13, $14)`,
        [
          f.id,
          f.name,
          f.description,
          f.imageUrl ?? null,
          f.imageAlt ?? null,
          f.platformSearchName ?? null,
          f.calories,
          f.cuisine,
          JSON.stringify(f.meal),
          JSON.stringify(f.diet),
          JSON.stringify(f.mood),
          f.budget,
          f.portion,
          f.yemeksepeti_query,
        ]
      );
    }
    console.log("[seed] Tamamlandı.");
  } catch (err) {
    console.error("[seed] Hata:", err);
  } finally {
    await pool.end();
  }
}

seed();
