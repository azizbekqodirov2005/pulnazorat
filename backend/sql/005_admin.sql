-- Admin panel uchun: foydalanuvchi rollari

ALTER TABLE users
  ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
