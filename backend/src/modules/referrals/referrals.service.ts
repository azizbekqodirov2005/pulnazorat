import crypto from "crypto";
import { pool } from "../../config/db";

export const REFERRALS_REQUIRED = 2;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // chalkash harflar (0/O, 1/I) olib tashlangan

function randomCode(length = 6): string {
  let code = "";
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

/** Yangi foydalanuvchi uchun takrorlanmas referal kod yaratadi. */
export async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const existing = await pool.query(`SELECT 1 FROM users WHERE referral_code = $1`, [code]);
    if (existing.rowCount === 0) return code;
  }
  // Juda kam ehtimol, lekin baribir to'xtab qolmasin deb uzunroq kod bilan urinib ko'ramiz
  return randomCode(10);
}

export async function findUserByReferralCode(code: string) {
  const result = await pool.query<{ id: string; plan: "free" | "pro" }>(
    `SELECT id, plan FROM users WHERE referral_code = $1`,
    [code]
  );
  return result.rows[0] ?? null;
}

/**
 * Referal orqali kelgan yangi foydalanuvchi ro'yxatdan o'tgach chaqiriladi.
 * Agar referrer endi yetarlicha do'st taklif qilgan bo'lsa (>= REFERRALS_REQUIRED)
 * va hali free bo'lsa — uni Pro'ga o'tkazadi.
 */
export async function maybeUnlockReferrerPro(referrerId: string): Promise<void> {
  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::int AS count FROM users WHERE referred_by = $1`,
    [referrerId]
  );
  const referredCount = Number(countResult.rows[0]?.count ?? 0);
  if (referredCount < REFERRALS_REQUIRED) return;

  await pool.query(
    `UPDATE users SET plan = 'pro', pro_unlocked_via = 'referral', updated_at = now()
     WHERE id = $1 AND plan = 'free'`,
    [referrerId]
  );
}

export interface ReferralStatus {
  code: string;
  referredCount: number;
  requiredCount: number;
  unlocked: boolean;
  unlockedViaReferral: boolean;
}

export async function getReferralStatus(userId: string): Promise<ReferralStatus> {
  const userResult = await pool.query<{
    referral_code: string;
    plan: "free" | "pro";
    pro_unlocked_via: string | null;
  }>(`SELECT referral_code, plan, pro_unlocked_via FROM users WHERE id = $1`, [userId]);
  const user = userResult.rows[0];
  if (!user) throw new Error("Foydalanuvchi topilmadi");

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::int AS count FROM users WHERE referred_by = $1`,
    [userId]
  );
  const referredCount = Number(countResult.rows[0]?.count ?? 0);

  return {
    code: user.referral_code,
    referredCount,
    requiredCount: REFERRALS_REQUIRED,
    unlocked: user.plan === "pro",
    unlockedViaReferral: user.pro_unlocked_via === "referral",
  };
}
