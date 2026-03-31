-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       VARCHAR(20)  NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  phone      VARCHAR(20),
  bio        TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Kurslar tablosu
CREATE TABLE IF NOT EXISTS courses (
  id          SERIAL PRIMARY KEY,
  teacher_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration    INTEGER, -- dakika cinsinden
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Abonelik paketleri tablosu
CREATE TABLE IF NOT EXISTS subscription_packages (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  duration    INTEGER NOT NULL DEFAULT 30, -- gün cinsinden
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Abonelikler tablosu
CREATE TABLE IF NOT EXISTS subscriptions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id INTEGER NOT NULL REFERENCES subscription_packages(id),
  status     VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),
  amount     NUMERIC(10,2) NOT NULL,
  payment_id INTEGER,
  starts_at  TIMESTAMP,
  ends_at    TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ödemeler tablosu
CREATE TABLE IF NOT EXISTS payments (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id),
  amount          NUMERIC(10,2) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  iyzico_id       VARCHAR(255),
  payment_data    JSONB,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Örnek abonelik paketleri
INSERT INTO subscription_packages (name, description, price, duration) VALUES
  ('Başlangıç', 'Aylık temel koçluk paketi', 299.00, 30),
  ('Standart', 'Aylık gelişmiş koçluk paketi', 499.00, 30),
  ('Premium', 'Aylık tam kapsamlı koçluk paketi', 799.00, 30)
ON CONFLICT DO NOTHING;
