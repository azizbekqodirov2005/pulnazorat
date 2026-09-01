-- Pro modullar: byudjet, takrorlanuvchi to'lov, maqsad, qarz-nasiya, obuna, to'lov

CREATE TYPE debt_direction AS ENUM ('owed_to_me', 'i_owe');
CREATE TYPE debt_status AS ENUM ('open', 'closed');
CREATE TYPE goal_status AS ENUM ('active', 'achieved', 'cancelled');
CREATE TYPE subscription_plan AS ENUM ('monthly', 'yearly');
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE payment_provider AS ENUM ('click', 'payme', 'dev');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed');

CREATE TABLE budgets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL REFERENCES categories(id),
  limit_amount NUMERIC(14,2) NOT NULL CHECK (limit_amount > 0),
  period_month DATE NOT NULL, -- oyning 1-kuni sifatida saqlanadi
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id, period_month)
);

CREATE TABLE recurring_payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                VARCHAR(150) NOT NULL,
  amount               NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  due_day              SMALLINT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  reminder_days_before SMALLINT NOT NULL DEFAULT 1,
  is_active            BOOLEAN NOT NULL DEFAULT true,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          VARCHAR(150) NOT NULL,
  target_amount  NUMERIC(14,2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  deadline       DATE,
  status         goal_status NOT NULL DEFAULT 'active',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE debts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  person_name VARCHAR(150) NOT NULL,
  direction   debt_direction NOT NULL,
  amount      NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  due_date    DATE,
  status      debt_status NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan        subscription_plan NOT NULL,
  status      subscription_status NOT NULL,
  started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_subscriptions_user ON subscriptions (user_id, status);

CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id  UUID NOT NULL REFERENCES subscriptions(id),
  amount           NUMERIC(14,2) NOT NULL,
  provider         payment_provider NOT NULL,
  provider_txn_id  VARCHAR(255),
  status           payment_status NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
