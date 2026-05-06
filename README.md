# Ne Yesem? — Akıllı Yemek Öneri Sistemi

Kullanıcıdan birkaç bilgi (öğün, kalori, mutfak, diyet, açlık, bütçe, ruh hali) alıp ona uygun yemekleri görselleriyle öneren; karta tıklayınca Yemeksepeti'ne yönlendiren modern bir web uygulaması.

Her kullanıcı seçimi **MySQL**'e kaydediliyor.

---

## Proje Yapısı

```
Yemek_Önerme_Sistemi/
├── backend/                  # Node.js + Express + MySQL API
│   ├── server.js
│   ├── db.js
│   ├── seed.js               # foods.json → MySQL aktarma
│   ├── package.json
│   └── .env.example
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── Hero.jsx
│   │   │   ├── Wizard.jsx
│   │   │   ├── Results.jsx
│   │   │   └── Footer.jsx
│   │   ├── data/
│   │   │   └── foods.json    ← 70 yemeklik veri seti (indirilebilir!)
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── database/
│   └── schema.sql            # MySQL tabloları
└── README.md
```

---

## Kurulum (Adım Adım)

### 1) Gereksinimler
- **Node.js** 18+ → https://nodejs.org
- **MySQL** 8+ → https://dev.mysql.com/downloads/mysql/  
  (Veya XAMPP / Laragon içinde gelen MySQL de olur.)

### 2) MySQL'i Hazırla

MySQL kuruluysa terminalde:

```bash
mysql -u root -p < database/schema.sql
```

Bu komut `yemek_oneri` veritabanını ve şu 3 tabloyu oluşturur:
- `foods` — yemek verisi (seed ile doldurulur)
- `user_preferences` — kullanıcının girdiği tercihler (**her form submit'i bir satır**)
- `recommendations` — hangi kullanıcıya hangi yemek önerildi + tıklandı mı

> **Not:** `mysql` komutu terminalden çalışmıyorsa MySQL Workbench ya da phpMyAdmin açıp `database/schema.sql` içeriğini kopyala-yapıştır yapıp çalıştırabilirsin. Aynı işi görür.

### 3) Backend'i Kur

```bash
cd backend
npm install
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```

Sonra `.env` dosyasını aç, `DB_PASSWORD` satırına **kendi MySQL root şifreni** yaz.

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=buraya_kendi_sifreni_yaz
DB_NAME=yemek_oneri
```

Sonra dataset'i MySQL'e yükle (opsiyonel ama tavsiye edilir):

```bash
npm run seed
```

Backend'i başlat:

```bash
npm run dev
```

`http://localhost:4000/api/health` adresine gidersen `{"status":"ok","db":true,"foods":70}` görmelisin.

### 4) Frontend'i Kur

Yeni bir terminal aç:

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` adresinde site açılır.

---

## MySQL'e Nasıl Kayıt Ediliyor? (Senin Sorduğun Şey)

Kullanıcı formu doldurup **"Öner Bana"** dediğinde şunlar oluyor:

1. Frontend (`Wizard.jsx`) → `POST /api/recommend` isteği atar (form verisini JSON olarak gönderir).
2. Backend (`server.js`) → formu alır, yemekleri filtreler.
3. Backend → `user_preferences` tablosuna **bir satır ekler** (meal, kaloriler, mutfaklar, diet, hunger, budget, mood, IP, user agent, timestamp).
4. Backend → önerilen her yemek için `recommendations` tablosuna satır ekler.
5. Kullanıcı bir yemeğe tıkladığında → `POST /api/click` → `recommendations.clicked = 1` yapılır.

**Kayıtları kontrol etmek için:**

```sql
-- Son 10 kullanıcı tercihi:
SELECT * FROM user_preferences ORDER BY created_at DESC LIMIT 10;

-- Hangi yemek kaç kere önerildi:
SELECT food_name, COUNT(*) AS toplam
FROM recommendations
GROUP BY food_name
ORDER BY toplam DESC;

-- Hangi yemek kaç kere Yemeksepeti'ne gitmek için tıklandı:
SELECT food_name, SUM(clicked) AS tiklanma
FROM recommendations
GROUP BY food_name
ORDER BY tiklanma DESC;
```

Ayrıca `GET /api/stats` endpoint'inden de istatistikleri JSON olarak çekebilirsin.

---

## Yemeksepeti'ne Yönlendirme Nasıl Çalışıyor? (Adım Adım)

Bu, en kritik kısım. Yemeksepeti'nin herkese açık bir "yemek ID" API'si yok, o yüzden **arama URL'i** üzerinden yönlendiriyoruz.

### Adım 1: Her yemeğe bir arama anahtarı ekledik
`frontend/src/data/foods.json` içinde her yemeğin `yemeksepeti_query` alanı var:

```json
{
  "name": "Adana Kebap",
  "yemeksepeti_query": "adana kebap"
}
```

### Adım 2: URL'i oluşturuyoruz
`Results.jsx` içindeki `buildYemeksepetiUrl()` fonksiyonu şunu yapar:

```javascript
function buildYemeksepetiUrl(query) {
  const q = encodeURIComponent(query);   // "adana%20kebap"
  return `https://www.yemeksepeti.com/search?q=${q}`;
}
```

### Adım 3: Karta tıklayınca yeni sekmede açıyoruz

```javascript
window.open(
  buildYemeksepetiUrl(food.yemeksepeti_query),
  "_blank",               // yeni sekme
  "noopener,noreferrer"   // güvenlik: yeni sekme referrer göndermez
);
```

Kullanıcı karta tıklar → Yemeksepeti arama sayfası yeni sekmede açılır → kendi adresini girer → o yemeği satan restoranları görür.

> **İleri seviye istersen:** Yemeksepeti bölgesel çalışıyor. Kullanıcının konumunu alıp (`navigator.geolocation`) URL'e eklemek mümkün, ama şu anki yapı da sorunsuz çalışıyor.

---

## Veri Setini İndirme / Düzenleme

Dataset tamamen **JSON dosyası**: `frontend/src/data/foods.json`

- **İndirmek için:** Dosyayı sağ tık → kopyala. O kadar. İstersen projenin dışına da taşıyabilirsin.
- **Düzenlemek için:** Yeni yemek eklemek, silmek, görsel değiştirmek için direkt JSON'u aç, düzenle, kaydet. Frontend otomatik okur (refresh yeter). Backend `seed.js` ile MySQL'e aktarırken de bu dosyayı kullanır.
- **MySQL'den almak için:** Seed çalıştırdıysan `SELECT * FROM foods` ile çekebilirsin, MySQL Workbench'ten export edebilirsin.

### Görseller Hakkında Not
Tüm resimler **Unsplash** CDN'den çekiliyor. Bazı linkler zamanla değişebilir. Değişirse kart otomatik olarak turuncu bir placeholder gösteriyor (`onError` fallback var). Kendi görsellerini koymak için `foods.json` içindeki `image` alanını değiştirmen yeter.

---

## Veri Seti Büyüklüğü

**70 yemek** var, siteye göre ideal seviyede:
- **Türk Mutfağı:** ~25 yemek (kebap, pide, mantı, döner, çorbalar, tatlılar vb.)
- **Fast Food:** ~10 yemek (burger, nugget, tavuk, patates vb.)
- **İtalyan:** ~7 yemek (pizza, pasta, risotto, tiramisu vb.)
- **Uzak Doğu:** ~6 yemek (sushi, ramen, pad thai vb.)
- **Meksika:** 3 yemek
- **Sağlıklı / Salata:** ~6 yemek
- **Deniz Ürünleri:** 3 yemek
- **Tatlılar:** ~8 yemek
- **Orta Doğu:** 2 yemek (falafel, humus)

Bu sayı, kullanıcının filtrelerine göre çeşitli öneriler çıkarmaya yetiyor. Eklemek istersen `foods.json`'a yeni kayıt eklemen yeterli — `id` benzersiz olsun yeter.

---

## Tech Stack

- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, Lucide React
- **Backend:** Node.js (ES Modules), Express, mysql2
- **Database:** MySQL 8
- **Image CDN:** Unsplash

---

## Önemli Endpoint'ler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/health` | Backend + DB durumu |
| GET | `/api/foods` | Tüm yemekler |
| POST | `/api/recommend` | Form gönder, öneri al (+ MySQL'e yazar) |
| POST | `/api/click` | Kart tıklama kaydı |
| GET | `/api/stats` | Toplam istek sayısı + en çok önerilenler |

---

## Sık Karşılaşılan Sorunlar

**"Sunucuya ulaşılamadı"**  
→ Backend çalışmıyor. Yeni terminalde `cd backend && npm run dev` yap.

**"Access denied for user 'root'@'localhost'"**  
→ `.env` dosyasındaki `DB_PASSWORD` yanlış. MySQL şifreni kontrol et.

**"ER_BAD_DB_ERROR: Unknown database 'yemek_oneri'"**  
→ `schema.sql`'i çalıştırmadın. `mysql -u root -p < database/schema.sql` yap.

**Görseller bozuk görünüyor**  
→ Internet bağlantısı veya Unsplash rate limit. Placeholder kendiliğinden devreye girer, veya `foods.json`'dan kendi linklerini koy.

---

İyi iştahlar kanka!
