/**
 * foods.json'a yeni yemekler ekler (id 101+). Tekrar çalıştırırsan 101+ satırları yeniler.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const foodsPath = path.resolve(__dirname, "../frontend/src/data/foods.json");

const img = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;

const PH = [
  106343, 1529040, 1565294, 1640772, 2097090, 3214167, 3764645, 5409015, 654018,
  674574, 699953, 1437267, 1626744, 1639557, 2313684, 2474658, 3026808, 3157555,
  410647, 410648, 4551832, 5638633, 6210876, 7692897, 8471797, 1565296, 1326942,
  1150440, 1583884, 825804, 1199957, 2641886, 3343626, 760281, 896922, 1059905,
  1279330, 1813504, 2252294, 2722877, 3184183, 361184, 3997609, 4224251, 4513013,
  4749776, 5082213, 5413847, 5740751, 6061816, 6383242, 6704556, 7025860, 7347164,
];
let pi = 0;
function phot() {
  const id = PH[pi % PH.length];
  pi++;
  return id;
}

let nid = 101;
function F(
  name,
  yemeksepeti_query,
  cuisine,
  calories,
  meal,
  diet,
  mood,
  budget,
  portion,
  description,
) {
  return {
    id: nid++,
    name,
    description: description || `${name} — popüler teslimat menülerinde sık aranan lezzet.`,
    image: img(phot()),
    calories,
    cuisine,
    meal,
    diet,
    mood,
    budget,
    portion,
    yemeksepeti_query,
  };
}

const extra = [
  F("Mercimek Çorbası", "mercimek çorbası", "Türk", 185, ["Öğle", "Akşam"], ["vejetaryen", "vegan", "glutensiz"], ["ferahlatıcı"], "ucuz", "küçük"),
  F("Ezogelin Çorbası", "ezogelin çorbası", "Türk", 160, ["Öğle", "Akşam"], ["vejetaryen", "vegan", "glutensiz"], ["baharatlı", "ferahlatıcı"], "ucuz", "küçük"),
  F("Tarhana Çorbası", "tarhana çorbası", "Türk", 190, ["Öğle", "Akşam"], ["vejetaryen"], ["tuzlu"], "ucuz", "küçük"),
  F("Izgara Tavuk Göğsü", "ızgara tavuk", "Türk", 320, ["Öğle", "Akşam"], ["glutensiz"], ["ferahlatıcı"], "orta", "orta"),
  F("Fırın Tavuk But", "fırın tavuk", "Türk", 420, ["Öğle", "Akşam"], ["glutensiz"], ["tuzlu"], "orta", "orta"),
  F("Tavuk Şiş", "tavuk şiş", "Türk", 380, ["Öğle", "Akşam"], ["glutensiz"], ["tuzlu", "baharatlı"], "orta", "orta"),
  F("Pirzola Kuzu", "kuzu pirzola", "Türk", 520, ["Akşam"], ["glutensiz"], ["tuzlu", "yağlı"], "premium", "büyük"),
  F("Kuzu Tandır", "kuzu tandır", "Türk", 580, ["Akşam"], ["glutensiz"], ["tuzlu"], "premium", "büyük"),
  F("Patlıcan Musakka", "musakka", "Türk", 340, ["Öğle", "Akşam"], ["vejetaryen"], ["tuzlu"], "orta", "orta"),
  F("Kabak Mücver (Fırın)", "kabak mücver", "Türk", 260, ["Öğle"], ["vejetaryen", "glutensiz"], ["ferahlatıcı"], "ucuz", "küçük"),
  F("Fasulye Pilaki", "fasulye pilaki", "Türk", 240, ["Öğle", "Akşam"], ["vejetaryen", "vegan", "glutensiz"], ["ferahlatıcı"], "ucuz", "orta"),
  F("Barbunya Pilaki", "barbunya pilaki", "Türk", 250, ["Öğle", "Akşam"], ["vejetaryen", "vegan", "glutensiz"], ["ferahlatıcı"], "ucuz", "orta"),
  F("Imam Bayıldı", "imam bayıldı", "Türk", 280, ["Öğle", "Akşam"], ["vejetaryen", "vegan", "glutensiz"], ["ferahlatıcı"], "orta", "orta"),
  F("Zeytinyağlı Enginar", "enginar", "Türk", 210, ["Öğle"], ["vejetaryen", "vegan", "glutensiz"], ["ferahlatıcı"], "orta", "küçük"),
  F("Çoban Salata", "çoban salata", "Türk", 120, ["Öğle", "Akşam"], ["vejetaryen", "vegan", "glutensiz"], ["ferahlatıcı"], "ucuz", "küçük"),
  F("Gavurdağı Salatası", "gavurdağı salatası", "Türk", 180, ["Öğle"], ["glutensiz"], ["baharatlı", "ferahlatıcı"], "orta", "küçük"),
  F("Piyaz Antakya", "piyaz", "Türk", 220, ["Öğle"], ["vejetaryen"], ["ferahlatıcı"], "ucuz", "orta"),
  F("Bulgur Pilavı", "bulgur pilavı", "Türk", 200, ["Öğle", "Akşam"], ["vejetaryen", "vegan", "glutensiz"], ["tuzlu"], "ucuz", "orta"),
  F("Ispanaklı Pirinç Pilavı", "ıspanaklı pilav", "Türk", 260, ["Öğle", "Akşam"], ["vejetaryen"], ["ferahlatıcı"], "ucuz", "orta"),
  F("Etli Kuru Fasulye", "etli kuru fasulye", "Türk", 480, ["Öğle", "Akşam"], [], ["tuzlu"], "orta", "orta"),
  F("Nohut Yahnisi", "nohut yahnisi", "Türk", 360, ["Öğle", "Akşam"], ["vejetaryen", "vegan"], ["baharatlı"], "ucuz", "orta"),
  F("Etli Nohut", "etli nohut", "Türk", 520, ["Öğle", "Akşam"], [], ["tuzlu", "baharatlı"], "orta", "büyük"),
  F("Pazı Yaprağı Dolması", "pazı dolması", "Türk", 290, ["Öğle", "Akşam"], ["vejetaryen"], ["ferahlatıcı"], "orta", "orta"),
  F("Çiğ Köfte Dürüm", "çiğ köfte", "Türk", 310, ["Öğle", "Akşam", "Atıştırmalık"], ["vejetaryen", "vegan"], ["baharatlı"], "ucuz", "küçük"),
  F("İçli Köfte (Adıyaman)", "içli köfte", "Türk", 340, ["Öğle", "Atıştırmalık"], [], ["tuzlu"], "orta", "orta"),
  F("Su Böreği", "su böreği", "Türk", 420, ["Kahvaltı", "Öğle"], ["vejetaryen"], ["tuzlu", "yağlı"], "orta", "orta"),
  F("Sigara Böreği", "sigara böreği", "Türk", 380, ["Kahvaltı", "Atıştırmalık"], ["vejetaryen"], ["tuzlu", "yağlı"], "ucuz", "küçük"),
  F("Menemen", "menemen", "Türk", 280, ["Kahvaltı", "Öğle"], ["vejetaryen", "glutensiz"], ["ferahlatıcı"], "ucuz", "orta"),
  F("Sucuklu Yumurta", "sucuklu yumurta", "Türk", 420, ["Kahvaltı"], ["glutensiz"], ["tuzlu", "yağlı"], "orta", "orta"),
  F("Peynir Tabağı", "peynir tabağı", "Türk", 350, ["Kahvaltı", "Atıştırmalık"], ["vejetaryen", "glutensiz"], ["tuzlu"], "orta", "küçük"),
  F("Ton Balıklı Salata", "ton balıklı salata", "Sağlıklı", 280, ["Öğle"], ["glutensiz"], ["ferahlatıcı"], "orta", "orta"),
  F("Tavuklu Sezar Salata", "sezar salata", "Sağlıklı", 320, ["Öğle", "Akşam"], [], ["ferahlatıcı"], "orta", "orta"),
  F("Avokado Kase", "avokado bowl", "Sağlıklı", 340, ["Öğle"], ["vejetaryen", "vegan", "glutensiz"], ["ferahlatıcı"], "premium", "orta"),
  F("Protein Salata Kasesi", "protein salata", "Sağlıklı", 360, ["Öğle", "Akşam"], ["glutensiz"], ["ferahlatıcı"], "premium", "orta"),
  F("Yeşil Smoothie Bowl", "smoothie bowl", "Sağlıklı", 240, ["Kahvaltı"], ["vejetaryen", "vegan", "glutensiz"], ["tatlı", "ferahlatıcı"], "premium", "küçük"),
  F("Yunan Salatası", "yunan salatası", "Sağlıklı", 220, ["Öğle"], ["vejetaryen", "glutensiz"], ["ferahlatıcı"], "orta", "küçük"),
  F("Izgara Somon & Brokoli", "ızgara somon", "Sağlıklı", 380, ["Akşam"], ["glutensiz"], ["ferahlatıcı"], "premium", "orta"),
  F("Tofu Sote", "tofu sote", "Sağlıklı", 260, ["Öğle", "Akşam"], ["vejetaryen", "vegan", "glutensiz"], ["baharatlı"], "orta", "orta"),
  F("Sebzeli Noodle (Tam Buğday)", "sebzeli noodle", "Sağlıklı", 300, ["Öğle"], ["vejetaryen"], ["ferahlatıcı"], "orta", "orta"),
  F("Barbunya Köftesi (Fırın)", "barbunya köftesi", "Sağlıklı", 240, ["Öğle"], ["vejetaryen", "vegan", "glutensiz"], ["ferahlatıcı"], "ucuz", "küçük"),
  F("Margherita Pizza", "margherita pizza", "İtalyan", 720, ["Öğle", "Akşam"], ["vejetaryen"], ["tuzlu"], "orta", "büyük"),
  F("Quattro Formaggi Pizza", "dört peynirli pizza", "İtalyan", 820, ["Öğle", "Akşam"], ["vejetaryen"], ["tuzlu", "yağlı"], "premium", "büyük"),
  F("Pepperoni Pizza", "pepperoni pizza", "İtalyan", 780, ["Öğle", "Akşam"], [], ["tuzlu", "baharatlı"], "orta", "büyük"),
  F("Funghi Pizza", "mantarlı pizza", "İtalyan", 680, ["Öğle", "Akşam"], ["vejetaryen"], ["tuzlu"], "orta", "orta"),
  F("Carbonara Makarna", "carbonara", "İtalyan", 720, ["Öğle", "Akşam"], [], ["tuzlu", "yağlı"], "orta", "orta"),
  F("Bolognese Makarna", "bolonez makarna", "İtalyan", 690, ["Öğle", "Akşam"], [], ["tuzlu"], "orta", "orta"),
  F("Pesto Makarna", "pesto makarna", "İtalyan", 640, ["Öğle", "Akşam"], ["vejetaryen"], ["ferahlatıcı"], "orta", "orta"),
  F("Risotto Mantarlı", "mantarlı risotto", "İtalyan", 580, ["Akşam"], ["vejetaryen", "glutensiz"], ["tuzlu", "yağlı"], "premium", "orta"),
  F("Caprese Salata", "caprese", "İtalyan", 280, ["Öğle"], ["vejetaryen", "glutensiz"], ["ferahlatıcı"], "orta", "küçük"),
  F("Bruschetta", "bruschetta", "İtalyan", 220, ["Atıştırmalık"], ["vejetaryen"], ["ferahlatıcı"], "ucuz", "küçük"),
  F("Tiramisu", "tiramisu", "Tatlı", 420, ["Atıştırmalık", "Akşam"], ["vejetaryen"], ["tatlı", "yağlı"], "orta", "küçük"),
  F("Klasik Cheeseburger", "cheeseburger", "Fast Food", 650, ["Öğle", "Akşam"], [], ["tuzlu", "yağlı"], "ucuz", "büyük"),
  F("Double Burger", "double burger", "Fast Food", 820, ["Öğle", "Akşam"], [], ["tuzlu", "yağlı"], "orta", "büyük"),
  F("Tavuk Burger", "tavuk burger", "Fast Food", 560, ["Öğle", "Akşam"], [], ["tuzlu"], "orta", "orta"),
  F("Patates Kızartması (Büyük)", "patates kızartması", "Fast Food", 480, ["Atıştırmalık"], ["vejetaryen", "vegan", "glutensiz"], ["tuzlu", "yağlı"], "ucuz", "orta"),
  F("Soğan Halkası", "soğan halkası", "Fast Food", 420, ["Atıştırmalık"], ["vejetaryen"], ["tuzlu", "yağlı"], "ucuz", "küçük"),
  F("Hot Dog", "hot dog", "Fast Food", 520, ["Öğle", "Atıştırmalık"], [], ["tuzlu"], "ucuz", "orta"),
  F("Tavuk Kanat (Acılı)", "acılı kanat", "Fast Food", 540, ["Akşam", "Atıştırmalık"], ["glutensiz"], ["baharatlı", "tuzlu"], "orta", "orta"),
  F("Nugget Menü", "tavuk nugget", "Fast Food", 580, ["Öğle", "Atıştırmalık"], [], ["tuzlu"], "ucuz", "orta"),
  F("Sushi Set (Karışık)", "sushi set", "Uzak Doğu", 480, ["Akşam"], ["glutensiz"], ["ferahlatıcı"], "premium", "orta"),
  F("California Roll", "california roll", "Uzak Doğu", 360, ["Öğle", "Akşam"], [], ["ferahlatıcı"], "premium", "küçük"),
  F("Ramen Tavuklu", "tavuklu ramen", "Uzak Doğu", 620, ["Öğle", "Akşam"], [], ["tuzlu", "baharatlı"], "orta", "büyük"),
  F("Udon Çorbası", "udon", "Uzak Doğu", 420, ["Öğle", "Akşam"], [], ["ferahlatıcı"], "orta", "orta"),
  F("Teriyaki Tavuk Bowl", "teriyaki tavuk", "Uzak Doğu", 520, ["Öğle", "Akşam"], [], ["tatlı", "tuzlu"], "orta", "orta"),
  F("Pad Thai Karides", "pad thai", "Uzak Doğu", 560, ["Öğle", "Akşam"], [], ["tatlı", "baharatlı"], "orta", "orta"),
  F("Kung Pao Tavuk", "kung pao tavuk", "Uzak Doğu", 580, ["Akşam"], [], ["baharatlı", "tatlı"], "orta", "orta"),
  F("Chicken Taco (3'lü)", "taco tavuk", "Meksika", 490, ["Öğle", "Akşam"], [], ["baharatlı"], "orta", "orta"),
  F("Beef Taco", "taco dana", "Meksika", 520, ["Öğle", "Akşam"], [], ["baharatlı", "tuzlu"], "orta", "orta"),
  F("Burrito Tavuklu", "tavuklu burrito", "Meksika", 620, ["Öğle", "Akşam"], [], ["baharatlı", "yağlı"], "orta", "büyük"),
  F("Nachos Peynirli", "nachos", "Meksika", 540, ["Atıştırmalık"], ["vejetaryen"], ["baharatlı", "tuzlu"], "orta", "orta"),
  F("Çiftlik Salata Tavuklu", "çiftlik salata", "Sağlıklı", 300, ["Öğle"], ["glutensiz"], ["ferahlatıcı"], "orta", "orta"),
  F("Izgara Hellim Peynirli Salata", "hellim salata", "Sağlıklı", 310, ["Öğle"], ["vejetaryen", "glutensiz"], ["ferahlatıcı", "tuzlu"], "orta", "orta"),
  F("Levrek Izgara", "levrek ızgara", "Deniz Ürünleri", 340, ["Akşam"], ["glutensiz"], ["ferahlatıcı", "tuzlu"], "premium", "orta"),
  F("Çupra Tava", "çupra tava", "Deniz Ürünleri", 420, ["Akşam"], ["glutensiz"], ["tuzlu"], "orta", "orta"),
  F("Karides Güveç", "karides güveç", "Deniz Ürünleri", 380, ["Akşam"], ["glutensiz"], ["tuzlu"], "premium", "orta"),
  F("Midye Tava", "midye tava", "Deniz Ürünleri", 360, ["Akşam", "Atıştırmalık"], [], ["tuzlu"], "orta", "küçük"),
  F("Balık Kokoreç", "balık ekmek", "Deniz Ürünleri", 390, ["Öğle", "Atıştırmalık"], [], ["tuzlu"], "ucuz", "orta"),
  F("Humus & Pide", "humus meze", "Orta Doğu", 320, ["Öğle", "Atıştırmalık"], ["vejetaryen", "vegan", "glutensiz"], ["ferahlatıcı"], "ucuz", "orta"),
  F("Falafel Dürüm", "falafel", "Orta Doğu", 460, ["Öğle", "Akşam"], ["vejetaryen", "vegan"], ["baharatlı"], "orta", "orta"),
  F("Şavuşka Salata Tahinli", "şavuşka salata", "Orta Doğu", 290, ["Öğle"], ["vejetaryen", "glutensiz"], ["tatlı", "ferahlatıcı"], "orta", "orta"),
  F("Şiş Tavuk Kebap Duble", "şiş tavuk", "Orta Doğu", 520, ["Akşam"], ["glutensiz"], ["tuzlu", "baharatlı"], "orta", "büyük"),
  F("Künefe Peynirli", "künefe", "Tatlı", 480, ["Atıştırmalık", "Akşam"], ["vejetaryen"], ["tatlı", "tuzlu"], "orta", "orta"),
  F("Sütlaç Fırın", "sütlaç", "Tatlı", 280, ["Atıştırmalık", "Akşam"], ["vejetaryen", "glutensiz"], ["tatlı"], "ucuz", "küçük"),
  F("Kazandibi", "kazandibi", "Tatlı", 320, ["Atıştırmalık"], ["glutensiz"], ["tatlı"], "orta", "küçük"),
  F("Mozzarella Peynirli Pizza", "mozzarella pizza", "İtalyan", 700, ["Öğle", "Akşam"], ["vejetaryen"], ["tuzlu", "yağlı"], "orta", "büyük"),
  F("Kıymalı Börek", "kıymalı börek", "Türk", 440, ["Kahvaltı", "Öğle"], [], ["tuzlu"], "orta", "orta"),
  F("Ispanaklı Börek", "ıspanaklı börek", "Türk", 380, ["Kahvaltı", "Öğle"], ["vejetaryen"], ["tuzlu"], "orta", "orta"),
  F("Karnıyarık Kıymalı", "karnıyarık", "Türk", 420, ["Öğle", "Akşam"], [], ["tuzlu", "baharatlı"], "orta", "orta"),
  F("Kuru Patlıcan Dolması Kıymalı", "patlıcan dolması", "Türk", 400, ["Öğle", "Akşam"], [], ["baharatlı", "tuzlu"], "orta", "orta"),
  F("Mücver Tabağı Yoğurtlu", "mücver", "Türk", 290, ["Öğle"], ["vejetaryen"], ["ferahlatıcı"], "ucuz", "orta"),
  F("Ali Nazik", "ali nazik", "Türk", 480, ["Akşam"], [], ["baharatlı", "tuzlu"], "orta", "orta"),
  F("Hünkar Beğendi (Küçük Pors.)", "hünkar beğendi", "Türk", 520, ["Akşam"], [], ["tuzlu", "yağlı"], "premium", "orta"),
  F("Mantılı Yoğurt (Kayseri Mantı Küçük)", "mantı küçük porsiyon", "Türk", 340, ["Öğle"], [], ["tuzlu"], "orta", "küçük"),
  F("Tavuk Döner Dürüm", "tavuk döner dürüm", "Türk", 520, ["Öğle", "Akşam", "Atıştırmalık"], [], ["tuzlu"], "ucuz", "orta"),
  F("Et Döner Porsiyon", "et döner", "Türk", 640, ["Öğle", "Akşam"], [], ["tuzlu", "yağlı"], "orta", "büyük"),
  F("Adana Kebap Yarım Pors.", "adana kebap küçük", "Türk", 460, ["Öğle", "Akşam"], [], ["baharatlı", "tuzlu"], "orta", "orta"),
  F("Yoğurtlu Çorba Tavuklu", "yayla çorbası tavuklu", "Türk", 220, ["Öğle"], ["glutensiz"], ["ferahlatıcı"], "ucuz", "küçük"),
  F("Sebzeli Tavuk Güveci", "tavuk güveç", "Türk", 360, ["Akşam"], ["glutensiz"], ["tuzlu", "ferahlatıcı"], "orta", "orta"),
  F("Yoğurtlu Semizotu Salatası", "semizotu salatası", "Sağlıklı", 180, ["Öğle"], ["vejetaryen", "glutensiz"], ["ferahlatıcı"], "ucuz", "küçük"),
  F("Lor Peynirli Omlet", "lor peynirli omlet", "Sağlıklı", 240, ["Kahvaltı"], ["vejetaryen", "glutensiz"], ["tuzlu", "ferahlatıcı"], "orta", "küçük"),
  F("Simit & Beyaz Peynir", "simit kahvaltı", "Türk", 410, ["Kahvaltı"], ["vejetaryen"], ["tuzlu"], "ucuz", "orta"),
  F("Çiğköfte Lahmacun Menü", "lahmacun menü", "Türk", 720, ["Öğle", "Akşam"], [], ["baharatlı", "tuzlu"], "orta", "büyük"),
];

const existing = JSON.parse(fs.readFileSync(foodsPath, "utf8"));
const base = existing.filter((f) => f.id <= 100);
const merged = [...base, ...extra];
fs.writeFileSync(foodsPath, JSON.stringify(merged, null, 2), "utf8");
console.log(`[append-foods] ${base.length} eski + ${extra.length} yeni = ${merged.length} kayıt.`);
