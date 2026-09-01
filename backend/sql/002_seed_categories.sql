-- Tizim standart kategoriyalari (barcha foydalanuvchilar uchun umumiy, user_id = NULL)
INSERT INTO categories (user_id, name, type, icon, is_system) VALUES
  (NULL, 'Oziq-ovqat', 'expense', '🍽️', true),
  (NULL, 'Transport', 'expense', '🚗', true),
  (NULL, 'Kommunal', 'expense', '💡', true),
  (NULL, 'Kiyim-kechak', 'expense', '👕', true),
  (NULL, 'Sog''liq', 'expense', '💊', true),
  (NULL, 'Ta''lim', 'expense', '📚', true),
  (NULL, 'Ko''ngilochar', 'expense', '🎬', true),
  (NULL, 'Boshqa chiqim', 'expense', '📦', true),
  (NULL, 'Oylik maosh', 'income', '💼', true),
  (NULL, 'Frilans', 'income', '💻', true),
  (NULL, 'Bonus', 'income', '🎁', true),
  (NULL, 'Boshqa kirim', 'income', '💰', true);
-- Eslatma: bu fayl faqat bir marta ishga tushiriladi (idempotent emas).
