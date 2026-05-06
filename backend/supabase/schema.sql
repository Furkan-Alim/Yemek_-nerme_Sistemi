-- =====================================================
-- Yemek Önerme Sistemi — PostgreSQL / Supabase şeması
-- (MySQL database/schema.sql yapısına karşılık gelir)
-- Supabase: SQL Editor'de çalıştırın veya migration olarak ekleyin.
-- =====================================================

-- Bağımlılık sırasına göre sil
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS users;

-- Kullanıcı hesapları (giriş / kayıt)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yemekler (npm run seed ile doldurulabilir)
CREATE TABLE foods (
  id INTEGER PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  image_alt VARCHAR(300),
  platform_search_name VARCHAR(200),
  calories INTEGER,
  cuisine VARCHAR(80),
  meal JSONB,
  diet JSONB,
  mood JSONB,
  budget VARCHAR(20),
  portion VARCHAR(20),
  yemeksepeti_query VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Form / tercih kayıtları
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100),
  user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  meal VARCHAR(30) NOT NULL,
  min_calories INTEGER,
  max_calories INTEGER,
  cuisines JSONB,
  diet VARCHAR(30),
  hunger VARCHAR(20),
  budget VARCHAR(20),
  mood JSONB,
  user_ip VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_created ON user_preferences (created_at);
CREATE INDEX idx_user_preferences_meal ON user_preferences (meal);
CREATE INDEX idx_user_preferences_user_id ON user_preferences (user_id);

-- Önerilen yemek satırları
CREATE TABLE recommendations (
  id SERIAL PRIMARY KEY,
  preference_id INTEGER NOT NULL REFERENCES user_preferences (id) ON DELETE CASCADE,
  food_id INTEGER NOT NULL,
  food_name VARCHAR(150),
  clicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recommendations_preference ON recommendations (preference_id);
CREATE INDEX idx_recommendations_food ON recommendations (food_id);
