-- Click/Payme to'lov integratsiyasi o'rniga: referal orqali Pro ochish
-- Foydalanuvchi hujjatsiz (merchant ro'yxatdan o'tmasdan) Pro'ni tekin ola oladi:
-- shaxsiy referal havolasi orqali 2 ta do'stini ro'yxatdan o'tkazsa, Pro avtomatik ochiladi.

-- Endi kerak bo'lmagan to'lov/obuna jadvallari (Click/Payme hech qachon ulanmagan edi)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS subscriptions;
DROP TYPE IF EXISTS subscription_plan;
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS payment_provider;
DROP TYPE IF EXISTS payment_status;

ALTER TABLE users
  ADD COLUMN referral_code VARCHAR(12) UNIQUE,
  ADD COLUMN referred_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN pro_unlocked_via VARCHAR(20); -- 'referral' | NULL (kelajakda boshqa usullar uchun joy)

CREATE INDEX idx_users_referred_by ON users (referred_by);
