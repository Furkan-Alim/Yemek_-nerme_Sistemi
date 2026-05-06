-- =====================================================
-- Yemek Önerme Sistemi - MySQL Schema
-- =====================================================
-- Çalıştırmadan önce MySQL'e bağlan ve bu dosyayı çalıştır:
--   mysql -u root -p < schema.sql
-- =====================================================

CREATE DATABASE IF NOT EXISTS yemek_oneri
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE yemek_oneri;

-- =====================================================
-- Kullanıcı hesapları (giriş / kayıt)
-- =====================================================
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS foods;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- Yemekler tablosu (opsiyonel seed için)
-- =====================================================
CREATE TABLE foods (
  id INT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  image VARCHAR(500) NULL,
  image_alt VARCHAR(300) NULL,
  platform_search_name VARCHAR(200) NULL,
  calories INT,
  cuisine VARCHAR(80),
  meal JSON,
  diet JSON,
  mood JSON,
  budget VARCHAR(20),
  portion VARCHAR(20),
  yemeksepeti_query VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- Kullanıcı tercihleri tablosu
-- Her form submit'i burada kayıt altına alınır
-- =====================================================
CREATE TABLE user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(100),
  user_id INT NULL,
  meal VARCHAR(30) NOT NULL,
  min_calories INT,
  max_calories INT,
  cuisines JSON,
  diet VARCHAR(30),
  hunger VARCHAR(20),
  budget VARCHAR(20),
  mood JSON,
  user_ip VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at),
  INDEX idx_meal (meal),
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_user_preferences_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================
-- Öneriler tablosu (hangi kullanıcıya hangi yemekler önerildi)
-- =====================================================
CREATE TABLE recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preference_id INT NOT NULL,
  food_id INT NOT NULL,
  food_name VARCHAR(150),
  clicked TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (preference_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
  INDEX idx_preference (preference_id),
  INDEX idx_food (food_id)
) ENGINE=InnoDB;

-- =====================================================
-- Kontrol için basit sorgular
-- =====================================================
SELECT COUNT(*) AS toplam_istek FROM user_preferences;
SELECT * FROM user_preferences ORDER BY created_at DESC LIMIT 10;
SELECT food_name, COUNT(*) AS kac_kere_onerildi FROM recommendations GROUP BY food_name ORDER BY kac_kere_onerildi DESC;
