/**
 * CDN'den düşemeyen kayıtlar için geçici Pexels URL'leri (curl ile HTTP 200 doğrulanmış).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foodsPath = path.join(__dirname, "../src/data/foods.json");

const pexels = (idNum) =>
  `https://images.pexels.com/photos/${idNum}/pexels-photo-${idNum}.jpeg?auto=compress&cs=tinysrgb&w=800`;

const PATCH = {
  15: pexels("5333508"),
  21: pexels("958545"),
  22: pexels("5949899"),
  23: pexels("1580464"),
  24: pexels("5949891"),
  31: pexels("1647165"),
  48: pexels("3184193"),
  50: pexels("1640772"),
  53: pexels("5949891"),
  65: pexels("7613564"),
  69: pexels("5333508"),
  70: pexels("1640772"),
  71: pexels("5333508"),
  73: pexels("7613564"),
  78: pexels("5333508"),
  79: pexels("1580464"),
  83: pexels("3184193"),
  88: pexels("1647165"),
  96: pexels("1580464"),
  98: pexels("5949899"),
};

const foods = JSON.parse(await fs.promises.readFile(foodsPath, "utf8"));
for (const f of foods) {
  if (PATCH[f.id]) f.image = PATCH[f.id];
}
await fs.promises.writeFile(
  foodsPath,
  `${JSON.stringify(foods, null, 2)}\n`,
  "utf8"
);
console.log("Patched remote URLs for CDN-fail IDs.");
