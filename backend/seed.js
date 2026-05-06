import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const foodsPath = path.resolve(__dirname, "../frontend/src/data/foods.json");
const foods = JSON.parse(fs.readFileSync(foodsPath, "utf-8"));

async function seed() {
  console.log(`[seed] ${foods.length} yemek MySQL'e yazılacak...`);
  try {
    await pool.query("DELETE FROM foods");
    for (const f of foods) {
      await pool.execute(
        `INSERT INTO foods
         (id, name, description, image, image_alt, platform_search_name, calories, cuisine, meal, diet, mood, budget, portion, yemeksepeti_query)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
