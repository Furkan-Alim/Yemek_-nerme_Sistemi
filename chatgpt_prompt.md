Aşağıdaki projeyi geliştirdim ve şu an MVP (Minimum Viable Product) aşamasındayım. Bu projeyle ilgili 2-3 sayfalık bir ara rapor yazman gerekiyor. Önce projeyi anlamak için tüm bilgileri oku, sonra sondaki üç ana sorunun her birini ayrı başlık altında, alt sorulara da tek tek cevap verecek şekilde detaylı yaz.

---

## PROJE: "Ne Yesem?" — Akıllı Yemek Öneri Sistemi

### Amaç
Kullanıcıdan kısa bir formla bilgi (öğün, kalori aralığı, mutfak tercihi, diyet, açlık seviyesi, bütçe, ruh hali) toplayan; bu girdileri puanlama yapan bir öneri motoruna besleyerek 70 yemeklik veri seti içinden en uygun yemekleri sıralı şekilde gösteren; karta tıklanınca Yemeksepeti üzerinde otomatik arama açan tam çalışır bir web uygulaması. Tüm kullanıcı tercihleri ve önerilen yemekler MySQL'de saklanıyor (gelecekteki ML modeli için eğitim verisi olarak).

### Teknoloji Yığını (Tech Stack)
- **Frontend:** React 18 + Vite + TailwindCSS + Framer Motion + Lucide React
- **Backend:** Node.js (ES Modules) + Express + mysql2/promise
- **Database:** MySQL 8 (utf8mb4_unicode_ci collation)
- **Görsel CDN:** Unsplash

### Klasör Yapısı
```
Yemek_Önerme_Sistemi/
├── backend/
│   ├── server.js          (Express API + scoring algoritması)
│   ├── db.js              (MySQL connection pool)
│   ├── seed.js            (foods.json → MySQL aktarma)
│   └── .env               (DB credentials)
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Hero.jsx
│       │   ├── Wizard.jsx       (7 adımlı form)
│       │   ├── Results.jsx      (öneri kartları)
│       │   ├── AdminPanel.jsx   (istatistik dashboard)
│       │   ├── Favorites.jsx
│       │   ├── RandomSpinner.jsx
│       │   └── OrderModal.jsx
│       └── data/foods.json      (70 yemek)
├── database/
│   └── schema.sql
└── README.md
```

### Veri Seti (foods.json)
70 manuel kürat'lü yemek kaydı. Her kayıt 12 alan içeriyor:
- `id`, `name`, `description`, `image`, `calories`
- `cuisine` (Türk, İtalyan, Fast Food, Uzak Doğu, Meksika, Sağlıklı, Deniz Ürünleri, Tatlı, Orta Doğu)
- `meal[]` (multi-label: Kahvaltı, Öğle, Akşam, Atıştırmalık)
- `diet[]` (multi-label: vejetaryen, vegan, glutensiz vb.)
- `mood[]` (multi-label: tuzlu, tatlı, baharatlı, yağlı, hafif vb.)
- `budget` (ucuz / orta / pahalı)
- `portion` (küçük / orta / büyük)
- `yemeksepeti_query` (Yemeksepeti arama anahtarı)

Mutfak dağılımı: ~25 Türk, ~10 Fast Food, ~7 İtalyan, ~6 Uzak Doğu, ~6 Sağlıklı, ~8 Tatlı, kalanı Meksika/Orta Doğu/Deniz Ürünleri.

### MySQL Şema (3 tablo)
```sql
foods            -- 70 yemek (id, name, description, image, calories, cuisine, meal JSON, diet JSON, mood JSON, budget, portion, yemeksepeti_query)
user_preferences -- her form gönderimi 1 satır (meal, min/max_calories, cuisines JSON, diet, hunger, budget, mood JSON, user_ip, user_agent, created_at)
recommendations  -- her öneri 1 satır (preference_id FK, food_id, food_name, clicked TINYINT, created_at)
```

### Öneri Algoritması (backend/server.js → scoreAndRank fonksiyonu)
**ML değil, alan bilgisine dayalı çok kriterli ağırlıklı skorlama modeli (heuristic ranking):**

1. **Hard filter:** Önce `meal` ve `diet` kısıtlarını sağlamayan yemekler elenir.
2. **Soft scoring:** Kalan adaylar 100 baz puanla başlar:
   - Kalori aralığında: **+25**, dışındaysa: **−|fark|/15**
   - Mutfak eşleşirse: **+20**, eşleşmezse: **−8**
   - Mood eşleşirse: **+12 × eşleşen sayısı**, eşleşmezse: **−6**
   - Bütçe eşleşirse: **+10**, eşleşmezse: **−4**
   - Açlık × porsiyon (hafif↔küçük: +10, hafif↔büyük: −12; cok_ac↔büyük: +10, cok_ac↔küçük: −12; orta↔orta: +5)
3. Skora göre azalan sıralanır, ilk 12 yemek döner.

**Hız:** Tüm 70 kayıt için <5ms. Cold-start problemine bağışık.

### REST API Endpoint'leri
- `GET  /api/health` — backend + DB durumu
- `GET  /api/foods` — tüm yemekler
- `POST /api/recommend` — tercih gönder, öneri al, MySQL'e kaydet
- `POST /api/click` — kart tıklama izleme (clicked = 1)
- `GET  /api/stats` — admin dashboard'u için istatistikler

### Kullanıcı Akışı
1. Hero ekranı → "Başla" butonu
2. **Wizard formu (7 adım):** öğün → kalori aralığı → mutfak (çoklu) → diyet → açlık → bütçe → ruh hali (çoklu)
3. Form `POST /api/recommend`'e gider
4. **Results sayfası:** Framer Motion animasyonlu kart grid'i, her kartta görsel + kalori + sebep açıklaması
5. Karta tıklayınca `https://www.yemeksepeti.com/search?q=<yemeksepeti_query>` URL'si yeni sekmede açılır + `POST /api/click` çağrılır
6. **Admin Panel** (`/admin`): toplam istek, en çok önerilen, en çok tıklanan, öğün/mutfak dağılımı, son 7 gün grafiği

### Pre-processing & Veri Kalitesi
- Tüm yemek kayıtları aynı 12-alanlı şemaya getirildi (manuel doğrulama)
- Sayısal olmayan alanlar **closed vocabulary** (sınırlı sözlük): budget ∈ {ucuz, orta, pahalı}, portion ∈ {küçük, orta, büyük}, hunger ∈ {hafif, orta, cok_ac}
- Multi-label alanlar (meal, diet, mood, cuisines) listede tutuluyor → MySQL'de JSON tipinde saklanıyor → JSON_CONTAINS ile sorgulanabilir
- Türkçe karakter koruması: MySQL utf8mb4_unicode_ci, Node mysql2 charset utf8mb4, frontend `<meta charset="UTF-8">`
- Seed işlemi idempotent: tekrar çalıştırınca önce DELETE FROM foods, sonra INSERT
- Form girdisi sanitizasyonu: sayısal alanlar Number() cast, string'ler .slice(0, 500), listeler JSON.stringify

### NA Değer Yönetimi
- Frontend: kullanıcı boş bıraktığı alanı request body'ye eklemez
- Backend default'lar: `minCalories=0, maxCalories=2000, cuisines=[], diet="fark_etmez", hunger="orta", budget="fark_etmez", mood=[]`
- Sadece `meal` zorunlu; gerisi opsiyonel
- Görsel: Unsplash 404 / rate-limit durumunda `<img onError>` callback'i ile turuncu placeholder
- DB: boş listeler NULL yerine `JSON.stringify([])` olarak yazılır

### Outlier Tespiti
| Alan | Aralık | Uygulanan |
|---|---|---|
| calories | 80–1200 kcal | Dışındakiler manuel düzeltildi |
| description | ≤200 karakter | Uzunlar kırpıldı |
| mood etiket sayısı | ≤3 | Skor şişirmesini önlemek için |
| image URL | sadece HTTPS Unsplash | Erişilemeyenler placeholder'a düşer |
| min/maxCalories (input) | 0–2000 | UI slider zaten sınırlı |

### Machine Learning Durumu
**MVP'de ML kullanılmadı — bilinçli tercih.** Sebep: cold-start (sıfır kullanıcı tıklama verisi). Bunun yerine:
- `user_preferences` ve `recommendations` tablolarına her oturum yazılıyor
- Bu **(input vector, candidate item, click label)** üçlüsü gelecekteki ML modelinin eğitim seti olacak
- Yeterli veri biriktiğinde planlananlar: implicit feedback üzerinden **logistic regression / LightGBM learning-to-rank**, tercih vektörlerinden **K-Means clustering**, click loglarıyla **collaborative filtering**

### LLM Entegrasyonu
**Şu an yok ama mimari hazır.** Planlanan akış:
1. Kullanıcı serbest metinle ihtiyacını yazar (örn. "hafif ama acılı bir şey, 600 kcal altı")
2. LLM (GPT-4o-mini gibi) bu metni `function calling` / `structured output` ile JSON tercih nesnesine çevirir
3. Aynı `scoreAndRank()` fonksiyonu çalışır

LLM **öneri kararını vermez**, sadece **doğal dilden yapısal tercihe çeviri** yapar — halüsinasyon riski sıfır, karar deterministik kalır.

### Şu Ana Kadar Tamamlananlar
1. ✅ React + Vite + Tailwind responsive frontend
2. ✅ 70 yemeklik manuel kürat'lü dataset
3. ✅ 7 adımlı Wizard formu
4. ✅ Animasyonlu sonuç kartları (Framer Motion)
5. ✅ Express REST API (5 endpoint)
6. ✅ MySQL şema (3 tablo, FK, index)
7. ✅ scoreAndRank heuristik skorlama motoru
8. ✅ Yemeksepeti yönlendirme (gerçek sipariş kanalı)
9. ✅ Tıklama takibi (clicked flag)
10. ✅ Admin Panel istatistik dashboard
11. ✅ seed.js idempotent veri yükleme

### Karşılaşılan Teknik Zorluklar ve Çözümler
1. **Yemeksepeti API kotası yok:** Herkese açık API olmadığı için her yemeğe `yemeksepeti_query` alanı eklendi → `https://www.yemeksepeti.com/search?q=...` URL'si yeni sekmede açılıyor (`noopener,noreferrer`).
2. **Türkçe karakter / encoding bozulması:** PowerShell, Node, MySQL arasında utf-8 trafiğinde "İskender" → "?skender" gibi sorunlar. Çözüm: tüm katmanların utf-8 / utf8mb4 ile çalışmasını sağladık.
3. **Cold-start problemi:** Tıklama verisi olmadığı için ML mantıklı sonuç üretemezdi. Çözüm: heuristik skorlama + gelecekteki ML için veri toplama altyapısı.
4. **Görsel CDN dayanıklılığı:** Unsplash bazen resim siliyor / rate-limit yapıyor. Çözüm: `onError` ile turuncu placeholder.
5. **Skor ağırlıklarının kalibrasyonu:** İlk denemelerde mutfak ağırlığı +50 idi, diğer kriterleri yutuyordu. Çözüm: 10+ persona ile manuel test, ağırlıklar dengelendi.
6. **MySQL bağlantı yönetimi:** Connection limit'e yaklaşma sorunu. Çözüm: mysql2/promise pool (`connectionLimit: 10`), `testConnection()` health check.

### Final Rapora Kadar Planlanan İşler
| Öncelik | Görev |
|---|---|
| Yüksek | LLM entegrasyonu (serbest metin → JSON tercih) |
| Yüksek | Veri setini 150+ yemeğe çıkarma |
| Yüksek | İlk 200 oturumdan sonra basit ML rerank prototipi |
| Orta | navigator.geolocation ile bölgesel Yemeksepeti URL'si |
| Orta | Admin Panel'e A/B testi ve cohort analizi |
| Orta | Görselleri kendi CDN'imize taşıma |
| Düşük | Anti-spam: IP başına dakikalık istek limiti |
| Düşük | Çok dilli destek (TR / EN) |

---

## SENDEN İSTENEN: 2-3 Sayfalık MVP Ara Raporu

Aşağıdaki üç ana başlığı, **her sorunun altındaki alt sorulara tek tek cevap verecek şekilde** detaylı yaz. Format Türkçe, akademik ama anlaşılır olsun. Her başlık 1 sayfaya yakın olmalı; toplamda 2-3 sayfa hedefle.

### 1) Data Processing
> *If data processing is involved, what steps and methods were used (Pre-processing, Filling Na values, Detect outliers, etc.)?*

Alt sorular:
- Veri işleme yapıldı mı?
- Hangi pre-processing adımları kullanıldı?
- Eksik (NA) değerler nasıl dolduruldu?
- Aykırı değerler (outlier) nasıl tespit edildi?

### 2) Model Design
> *Has a model been designed for data processing? Are machine learning models used to process the data? Is there a basic interface where the end user can input data and obtain a simple analysis result via the LLM?*

Alt sorular:
- Veri işleme için bir model tasarlandı mı? (Tasarlanmışsa nasıl çalışıyor? Skor ağırlıkları tablosunu mutlaka ekle.)
- Machine Learning modeli kullanıldı mı? (Hayırsa neden, ileride nasıl planlanıyor?)
- Kullanıcının veri girip LLM üzerinden sonuç aldığı bir arayüz var mı? (Mevcut Wizard arayüzünü ve planlanan LLM akışını anlat.)

### 3) Development Report
> *What has been achieved so far? What technical challenges were encountered (e.g., API quotas, data sanitization barriers) and how are they overcome? What work do you plan to do in the final report?*

Alt sorular:
- Şu ana kadar neler başarıldı? (Liste/tablo formatında.)
- Hangi teknik zorluklarla karşılaşıldı ve nasıl aşıldı? (Her zorluk için ayrı paragraf.)
- Final rapora kadar yapılması planlanan işler nelerdir? (Öncelik tablosu.)

**Önemli:**
- Her alt soruyu kalın başlık olarak yaz, altında cevabı ver.
- Tablo, kod bloğu, madde işareti gibi görsel öğeleri kullanmaktan çekinme.
- "Cold-start" gibi teknik terimleri kullanırken kısaca açıkla.
- Akademik dilde yaz ama jargon'a boğma.
- Sonuç bölümüyle bitir (kısa özet, 1 paragraf).
