# Ne Yesem? — MVP Ara Raporu

**Proje:** Akıllı Yemek Öneri Sistemi
**Stack:** React (Vite + Tailwind) — Node.js (Express) — MySQL 8
**Hazırlayan:** Furkan
**Aşama:** Minimum Viable Product (MVP)

---

## Kısa Proje Tanıtımı

"Ne Yesem?" kullanıcıdan kısa bir formla bilgi (öğün, kalori aralığı, mutfak tercihi, diyet, açlık, bütçe, ruh hali) toplayan; bu girdileri puanlama yapan bir öneri motoruna besleyerek 70 yemeklik veri seti içinden kullanıcıya en uygun yemekleri sıralı şekilde gösteren; karta tıklanınca Yemeksepeti üzerinde otomatik arama açan tam çalışır bir web uygulamasıdır. Tüm kullanıcı tercihleri ve önerilen yemekler MySQL'de saklanır.

---

# 1) Data Processing

> **Soru:** *If data processing is involved, what steps and methods were used (Pre-processing, Filling Na values, Detect outliers, etc.)?*

## 1.1 Veri işleme yapıldı mı? (Is data processing involved?)

Evet. Sistemde iki ayrı veri akışı vardır ve her ikisi de işleme tabidir:
- **Yemek veri seti (statik):** 70 kayıtlı `foods.json` dosyası, MySQL'deki `foods` tablosuna aktarılır.
- **Kullanıcı tercih verisi (dinamik):** Her form gönderiminde `user_preferences` ve `recommendations` tablolarına kayıt edilir.

## 1.2 Hangi ön işleme (pre-processing) adımları kullanıldı?

1. **Şema doğrulama:** Tüm yemek kayıtlarının aynı 12 alana sahip olması zorunlu kılındı (`id, name, description, image, calories, cuisine, meal[], diet[], mood[], budget, portion, yemeksepeti_query`). Eksik alanlı kayıtlar tamamlandı.
2. **Kategori sözlüğü oluşturma (closed vocabulary):** Sayısal olmayan tüm alanlar sınırlı bir küme ile çalışır:
   - `budget` ∈ {`ucuz`, `orta`, `pahalı`, `fark_etmez`}
   - `portion` ∈ {`küçük`, `orta`, `büyük`}
   - `hunger` ∈ {`hafif`, `orta`, `cok_ac`}
   - `meal`, `diet`, `mood` çoklu etiket (multi-label) listeleri
   Bu sayede yazım farklılıkları (örn. "ORTA" vs "orta") sorunu önlendi.
3. **Karakter normalizasyonu:** Türkçe karakterlerin (ç, ğ, ı, ö, ş, ü) bozulmaması için MySQL `utf8mb4_unicode_ci` collation ile, Node.js `mysql2` bağlantı havuzu `charset: "utf8mb4"` ile, frontend ise `<meta charset="utf-8">` ile tek tip kodlama kullanır.
4. **JSON serileştirme:** Liste alanları (`meal`, `diet`, `mood`, `cuisines`) MySQL'in `JSON` veri tipiyle saklanır. Bu sayede analiz sorgularında `JSON_CONTAINS` ile direkt arama yapılabilir.
5. **Seed işlemi:** `backend/seed.js` JSON'u okur, her kaydı parametrik `INSERT` ile veritabanına yazar. Tekrar çalıştırıldığında önce `DELETE FROM foods` yapıp temiz state ile başlar (idempotent).
6. **Form girdisi sanitizasyonu:** `/api/recommend` endpoint'ine gelen sayısal alanlar `Number()` ile zorla cast edilir, string alanlar `.slice(0, 500)` ile uzunluk sınırlarına indirilir, listeler `JSON.stringify()` ile güvenli halde yazılır.

## 1.3 Eksik (NA) değerler nasıl dolduruldu? (Filling NA values)

Üç farklı katmanda NA toleransı var:

- **Frontend (Wizard formu):** Kullanıcı bir adımı boş geçtiyse o alan istek gövdesine eklenmez; yerine backend'in default'u devreye girer.
- **Backend (varsayılan değerler):** `scoreAndRank()` fonksiyonu eksik alanları şu varsayılanlarla doldurur:
  ```javascript
  minCalories = 0, maxCalories = 2000,
  cuisines = [], diet = "fark_etmez",
  hunger = "orta", budget = "fark_etmez", mood = []
  ```
  Yani sistem **hiçbir alan zorunlu değildir** (sadece `meal` zorunludur) ilkesiyle çalışır.
- **Görsel (image) eksiği:** Unsplash CDN'in 404 / rate-limit ihtimaline karşı `Results.jsx` içinde her `<img>` etiketi `onError` callback'iyle turuncu placeholder'a düşer. UI hiçbir zaman bozuk görsel göstermez.
- **Veritabanı tarafında:** Boş listeler `JSON.stringify([])` olarak yazılır (NULL yerine), istatistik sorgularında bu boş listeler atlanır.

## 1.4 Aykırı değerler (outlier) nasıl tespit edildi?

Veri seti küçük ve manuel kürat'lü olduğu için **kural tabanlı sınırlar** uygulandı:

| Alan | Kabul edilebilir aralık | Outlier ile ne yapıldı? |
|---|---|---|
| `calories` | 80 – 1200 kcal | Bu aralık dışı kayıtlar manuel düzeltildi |
| `description` | ≤ 200 karakter | UI taşmasına yol açanlar kırpıldı |
| `mood` etiket sayısı | en fazla 3 | Skor fonksiyonunda dengesiz şişirme yapıyordu, fazlalar çıkarıldı |
| `image` URL | sadece HTTPS Unsplash | Erişilemeyen linkler placeholder'a düşürüldü |
| Kullanıcı tarafındaki `min/maxCalories` | 0 – 2000 | Slider zaten bu aralığı geçemiyor |

Ayrıca dinamik veride bir kullanıcı kısa sürede çok sayıda istek gönderirse `user_ip` ve `user_agent` alanlarıyla bu durum izlenebilir (anti-spam için final raporda eklenecek).

---

# 2) Model Design

> **Soru:** *Has a model been designed for data processing? Are machine learning models used to process the data? Is there a basic interface where the end user can input data and obtain a simple analysis result via the LLM?*

## 2.1 Veri işleme için bir model tasarlandı mı? (Has a model been designed?)

**Evet.** Ancak bu model **istatistiksel/ML tabanlı değil**, alan bilgisine (domain knowledge) dayalı **çok kriterli ağırlıklı skorlama modeli** olarak tasarlandı. Model `backend/server.js` dosyasında `scoreAndRank(prefs)` fonksiyonu olarak yer alır. Çalışma prensibi:

1. **Hard filter (eleme):** Önce kesin kısıtları uygular — `meal` uyumu ve `diet` kısıtı. Bunlardan birini sağlamayan yemek aday havuzundan silinir.
2. **Soft scoring (skorlama):** Kalan adayların her birine 100 baz puan verilir, sonra şu ağırlıklarla artırılır/azaltılır:

| Kriter | Eşleşme bonus | Eşleşmeme cezası |
|---|---|---|
| Kalori aralığında | +25 | −\|fark\|/15 |
| Mutfak tercihi (cuisine) | +20 | −8 |
| Mood etiket sayısı (mood) | +12 × eşleşen | −6 |
| Bütçe (budget) | +10 | −4 |
| Açlık × porsiyon eşleşmesi | +5 / +10 | −12 |

3. **Sıralama:** Skora göre azalan sırada sıralanır, ilk 12 yemek kullanıcıya döner.

Yaklaşım son derece hızlıdır (tüm 70 kayıt için <5ms), şeffaftır ("neden bu yemek önerildi?" sorusu net cevaplanabilir) ve **cold-start probleminden bağımsızdır** — yani sıfır kullanıcıyla bile mantıklı öneri verebilir.

## 2.2 Veriyi işlemek için Machine Learning modeli kullanıldı mı?

**Bu MVP aşamasında hayır, kullanılmadı — bilinçli bir tercih sonucu.** Sebepleri:
- Sistem henüz kullanıcı tıklama / beğeni verisi toplamadığı için **klasik cold-start** durumundadır.
- Bir collaborative filtering veya matrix factorization modelinin anlamlı çıktı üretmesi için en az 200-500 kullanıcı oturumu ve etkileşim verisi gerekir.
- Bu yüzden MVP boyunca toplanan verinin **gelecekteki ML modelinin eğitim seti** olması hedeflendi.

**Ne topluyoruz?** Her form gönderiminde:
- `user_preferences` tablosuna 1 satır (kullanıcının girdileri)
- `recommendations` tablosuna 12 satır (önerilen yemekler)
- Kullanıcı bir karta tıklarsa ilgili satırda `clicked = 1` flag'i set edilir

Bu yapı **(input vector, candidate item, click label)** üçlüsünü oluşturur — yani gelecekte:
- Implicit feedback üzerinden **logistic regression / LightGBM** ile bir learning-to-rank modeli eğitebiliriz.
- Tercih vektörlerinden **K-Means clustering** ile kullanıcı tipleri çıkarabiliriz.
- Tıklama loglarından **collaborative filtering** uygulayabiliriz.

Final raporda ilk 200 oturum biriktiğinde basit bir ML prototipi göstermek planlanıyor.

## 2.3 Kullanıcının veri girip LLM üzerinden analiz sonucu alabildiği basit bir arayüz var mı?

**Şu an LLM entegrasyonu yok**, ancak **kullanıcının veri girip yapısal analiz sonucu alabildiği bir arayüz var.** Bu arayüz `frontend/src/components/Wizard.jsx` ve `Results.jsx` dosyalarında uygulanmıştır. Akış:

1. Kullanıcı **7 adımlı sihirbaz formu** doldurur (öğün → kalori → mutfak → diyet → açlık → bütçe → ruh hali).
2. Form `POST /api/recommend` endpoint'ine JSON olarak gönderilir.
3. Backend'in skorlama modeli (2.1) çalışır, sıralı 12 yemek + sebep açıklaması döner.
4. Frontend bu sonucu animasyonlu kart grid'i olarak gösterir; her kartta yemek görseli, kalori, neden önerildiği yer alır.

LLM **henüz devreye alınmadı**, fakat arayüz LLM eklenmeye hazır şekilde tasarlandı. Final raporda planlanan akış:

1. Kullanıcı serbest metinle ne istediğini yazar (örn. *"hafif ama acılı bir şey, 600 kalori altı"*).
2. LLM (GPT-4o-mini veya benzeri) bu metni `function calling` / `structured output` ile JSON tercih nesnesine çevirir.
3. Aynı `scoreAndRank()` fonksiyonu çalışır.

Bu yaklaşımda LLM **öneri kararını vermez**, sadece **doğal dilden yapısal tercihe çeviri** yapar. Böylece halüsinasyon riski sıfırlanır, öneri kararı deterministik kalır.

---

# 3) Development Report

> **Soru:** *What has been achieved so far? What technical challenges were encountered (e.g., API quotas, data sanitization barriers) and how are they overcome? What work do you plan to do in the final report?*

## 3.1 Şu ana kadar neler başarıldı? (What has been achieved so far?)

| # | Bileşen | Durum |
|---|---|---|
| 1 | React + Vite + Tailwind ile responsive frontend | ✅ Tamamlandı |
| 2 | 70 yemeklik manuel kürat'lü dataset (`foods.json`) | ✅ Tamamlandı |
| 3 | 7 adımlı Wizard form (kullanıcı girdisi) | ✅ Tamamlandı |
| 4 | Animasyonlu sonuç kartları (Framer Motion) | ✅ Tamamlandı |
| 5 | Node.js + Express REST API (5 endpoint) | ✅ Tamamlandı |
| 6 | MySQL şema + 3 tablo (FK + index) | ✅ Tamamlandı |
| 7 | `scoreAndRank()` heuristik skorlama motoru | ✅ Tamamlandı |
| 8 | Yemeksepeti arama URL'i ile gerçek sipariş yönlendirme | ✅ Tamamlandı |
| 9 | Tıklama takibi (`clicked` flag) | ✅ Tamamlandı |
| 10 | Admin Panel (`/admin`) — istatistik dashboard'u | ✅ Tamamlandı |
| 11 | `seed.js` ile JSON → MySQL veri aktarımı | ✅ Tamamlandı |

**Kullanılabilen 5 API endpoint:**
- `GET  /api/health` — backend + DB durumu
- `GET  /api/foods` — tüm yemekler
- `POST /api/recommend` — tercih gönder, öneri al + DB'ye kaydet
- `POST /api/click` — kart tıklama izleme
- `GET  /api/stats` — admin için istatistikler

## 3.2 Hangi teknik zorluklarla karşılaşıldı ve nasıl aşıldı?

### Zorluk 1: Yemeksepeti API kotası / kısıtı yok
**Problem:** Yemeksepeti'nin herkese açık restaurant veya yemek arama API'si bulunmuyor. Doğrudan veri çekemiyoruz.
**Çözüm:** Her yemek kaydına bir `yemeksepeti_query` alanı eklendi (örn. `"adana kebap"`). Frontend bu query'yi `encodeURIComponent` ile temizleyip `https://www.yemeksepeti.com/search?q=<query>` URL'sine dönüştürüyor ve yeni sekmede `noopener,noreferrer` güvenlik flag'leri ile açıyor. Kullanıcı için neredeyse şeffaf çalışıyor.

### Zorluk 2: Veri sanitizasyon engelleri (Türkçe karakter / encoding)
**Problem:** PowerShell terminal, Node.js sunucu ve MySQL arasında Türkçe karakterler (ç, ğ, ı, ö, ş, ü) bozuluyordu. Özellikle `seed.js` ile veri yüklenirken `İskender` → `?skender` oluyordu.
**Çözüm:** Üç katmanın da utf-8 / utf8mb4 ile çalışmasını sağladık:
- MySQL şema: `CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
- Node.js `mysql2` pool: `charset: "utf8mb4"`
- HTML head: `<meta charset="UTF-8" />`
- VS Code dosya kodlaması UTF-8 (BOM yok)

### Zorluk 3: Cold-start problemi
**Problem:** Henüz kullanıcı tıklama verisi olmadığı için ML tabanlı bir öneri sistemi anlamlı sonuç üretemiyordu.
**Çözüm:** MVP için ML yerine alan bilgisine dayalı heuristik skorlama (bkz. 2.1), aynı zamanda gelecekteki ML için veri toplama altyapısı kuruldu.

### Zorluk 4: Görsel CDN dayanıklılığı
**Problem:** Unsplash bazı resimleri kaldırıyor veya rate-limit uyguluyor. Bozuk görsel UI'ı çirkinleştiriyordu.
**Çözüm:** Her `<img>` etiketine `onError` callback eklendi; başarısızlıkta turuncu placeholder gösteriliyor. UI hiçbir zaman "kırık resim" göstermiyor.

### Zorluk 5: Skor ağırlıklarının kalibrasyonu
**Problem:** İlk denemelerde mutfak tercihinin (cuisine) ağırlığı +50 idi ve diğer tüm kriterleri yutuyordu — kullanıcı "düşük kalori" istese bile yüksek kalori yemek üst sıraya geliyordu.
**Çözüm:** Her kriter ayrı ayrı manuel test edildi (10+ farklı persona ile), ağırlıklar 2.1 tablosundaki dengeli değerlere çekildi. Final raporda A/B testi ile ağırlıkları otomatik optimize etmeyi planlıyoruz.

### Zorluk 6: MySQL bağlantı yönetimi
**Problem:** Geliştirme sırasında bağlantılar açık kalıp connection limit'e yaklaşıyordu.
**Çözüm:** `mysql2/promise` connection pool kullanıldı (`connectionLimit: 10`), her sorgu sonrası otomatik release. `testConnection()` health check fonksiyonu eklendi.

## 3.3 Final rapora kadar yapılması planlanan işler

| Öncelik | Görev | Beklenen Sonuç |
|---|---|---|
| Yüksek | LLM entegrasyonu (serbest metin → JSON tercih) | Wizard formuna alternatif "doğal dil" girişi |
| Yüksek | Veri setini 150+ yemeğe çıkarma | Daha çeşitli öneri yelpazesi |
| Yüksek | İlk 200 oturumdan sonra basit ML rerank prototipi | Heuristik vs ML A/B testi |
| Orta | `navigator.geolocation` ile bölgesel Yemeksepeti URL'si | Daha alakalı restoran sonuçları |
| Orta | Admin Panel'e A/B testi ve cohort analizi | Karar destek tablosu |
| Orta | Görselleri kendi CDN'imize taşıma | Unsplash bağımlılığını kırma |
| Düşük | Anti-spam: aynı IP'den dakika başına istek limiti | Veri kalitesini koruma |
| Düşük | Çok dilli destek (TR / EN) | Daha geniş kullanıcı kitlesi |

---

## Sonuç

MVP, **kullanıcı girdisi → öneri → gerçek sipariş kanalı** akışını uçtan uca, hatasız ve test edilebilir biçimde gerçekleştirmektedir. Mimari, hem ML hem LLM bileşenlerinin sürtünmesiz şekilde eklenmesine olanak tanıyan **modüler ve veri toplayan** bir yapıda kurulmuştur. Final rapor aşamasında öncelik LLM entegrasyonu ile doğal dil girişi ve toplanan verilerle ilk ML prototipi olacaktır.
