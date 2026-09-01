/**
 * Birinchi admin akkauntini yaratish uchun terminal skripti.
 * API orqali ochilmagan — bu ataylab shunday, hech kim tashqaridan o'zini admin
 * qilib qo'ya olmasligi kerak. Faqat serverga to'g'ridan-to'g'ri kirish huquqi
 * bor odam (siz) ishga tushira oladi.
 *
 * Ishlatish: npm run make-admin -- email@misol.com
 */
import { pool } from "../config/db";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Foydalanish: npm run make-admin -- email@misol.com");
    process.exit(1);
  }

  const result = await pool.query<{ id: string; email: string | null; full_name: string }>(
    `UPDATE users SET role = 'admin', updated_at = now() WHERE email = $1 RETURNING id, email, full_name`,
    [email]
  );

  if (result.rowCount === 0) {
    console.error(`Bunday email bilan foydalanuvchi topilmadi: ${email}`);
    console.error("Avval shu email bilan platformada oddiy foydalanuvchi sifatida ro'yxatdan o'ting, keyin qayta urinib ko'ring.");
    process.exitCode = 1;
  } else {
    const user = result.rows[0];
    console.log(`✓ Admin qilindi: ${user.full_name} (${user.email})`);
  }

  await pool.end();
}

main().catch((err) => {
  console.error("Xatolik:", err);
  process.exit(1);
});
