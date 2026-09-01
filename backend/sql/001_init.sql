-- PulNazorat — boshlang'ich sxema (MVP: users, categories, transactions)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE plan_type AS ENUM ('free', 'pro');
CREATE TYPE tx_type AS ENUM ('income', 'expense');

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE,
  phone         VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  currency      VARCHAR(3) NOT NULL DEFAULT 'UZS',
  language      VARCHAR(2) NOT NULL DEFAULT 'uz',
  plan          plan_type NOT NULL DEFAULT 'free',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  type       tx_type NOT NULL,
  icon       VARCHAR(50),
  is_system  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_categories_user_type ON categories (user_id, type);

CREATE TABLE transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id),
  type         tx_type NOT NULL,
  amount       NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  note         VARCHAR(500),
  occurred_on  DATE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tx_user_date ON transactions (user_id, occurred_on DESC);
CREATE INDEX idx_tx_user_category ON transactions (user_id, category_id);
