import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomInt } from "crypto";
import { pool } from "../../config/db";
import { env } from "../../config/env";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../common/errors";
import { sendEmail } from "../../common/email";
import * as referralsService from "../referrals/referrals.service";

const RESET_CODE_TTL_MINUTES = 15;

export interface RegisterInput {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  referralCode?: string;
}

export interface LoginInput {
  emailOrPhone: string;
  password: string;
}

interface UserRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  password_hash: string;
  currency: string;
  language: string;
  plan: "free" | "pro";
  is_active: boolean;
  referral_code: string;
  role: "user" | "admin";
  password_reset_code_hash: string | null;
  password_reset_expires_at: Date | null;
}

function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    currency: row.currency,
    language: row.language,
    plan: row.plan,
    referralCode: row.referral_code,
    role: row.role,
  };
}

export function issueTokens(userId: string, plan: "free" | "pro") {
  const accessToken = jwt.sign({ userId, plan }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpires,
  } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpires,
  } as jwt.SignOptions);
  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput) {
  const { fullName, email, phone, password, referralCode } = input;

  const existing = await pool.query<UserRow>(
    `SELECT * FROM users WHERE ($1::text IS NOT NULL AND email = $1) OR ($2::text IS NOT NULL AND phone = $2)`,
    [email ?? null, phone ?? null]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    throw new ConflictError("Bu email yoki telefon raqami bilan foydalanuvchi allaqachon mavjud");
  }

  // Agar referal kod noto'g'ri yoki topilmasa — bu ro'yxatdan o'tishni to'xtatmaydi, shunchaki e'tiborsiz qoldiriladi
  const referrer = referralCode ? await referralsService.findUserByReferralCode(referralCode.trim().toUpperCase()) : null;

  const passwordHash = await bcrypt.hash(password, 10);
  const newReferralCode = await referralsService.generateUniqueReferralCode();
  const result = await pool.query<UserRow>(
    `INSERT INTO users (full_name, email, phone, password_hash, referral_code, referred_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [fullName, email ?? null, phone ?? null, passwordHash, newReferralCode, referrer?.id ?? null]
  );
  const user = result.rows[0];

  if (referrer) {
    await referralsService.maybeUnlockReferrerPro(referrer.id);
  }

  const tokens = issueTokens(user.id, user.plan);
  return { user: toPublicUser(user), ...tokens };
}

export async function login(input: LoginInput) {
  const { emailOrPhone, password } = input;
  const result = await pool.query<UserRow>(
    `SELECT * FROM users WHERE email = $1 OR phone = $1`,
    [emailOrPhone]
  );
  const user = result.rows[0];
  if (!user || !user.is_active) {
    throw new UnauthorizedError("Email yoki parol noto'g'ri");
  }
  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw new UnauthorizedError("Email yoki parol noto'g'ri");
  }
  const tokens = issueTokens(user.id, user.plan);
  return { user: toPublicUser(user), ...tokens };
}

export async function getUserById(userId: string) {
  const result = await pool.query<UserRow>(`SELECT * FROM users WHERE id = $1`, [userId]);
  if (!result.rows[0]) return null;
  return toPublicUser(result.rows[0]);
}

export async function updateProfile(userId: string, fullName: string) {
  const result = await pool.query<UserRow>(
    `UPDATE users SET full_name = $2 WHERE id = $1 RETURNING *`,
    [userId, fullName]
  );
  if (!result.rows[0]) throw new UnauthorizedError("Foydalanuvchi topilmadi");
  return toPublicUser(result.rows[0]);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const result = await pool.query<UserRow>(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = result.rows[0];
  // Foydalanuvchi so'rovi bo'yicha: agar bu email bilan hisob mavjud bo'lmasa, aniq xabar beramiz
  // (email enumeration xavfidan ko'ra, foydalanuvchiga aniqlik muhimroq deb belgilandi).
  if (!user || !user.is_active) {
    throw new NotFoundError("Bu email bilan ro'yxatdan o'tilmagan");
  }

  const code = String(randomInt(100000, 1000000)); // har doim 6 xonali
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + RESET_CODE_TTL_MINUTES * 60 * 1000);

  await pool.query(
    `UPDATE users SET password_reset_code_hash = $2, password_reset_expires_at = $3 WHERE id = $1`,
    [user.id, codeHash, expiresAt]
  );

  await sendEmail(
    email,
    "HamyonPro — parolni tiklash kodi",
    `<div style="font-family:sans-serif;font-size:15px;color:#0f172a">
       <p>Parolni tiklash uchun tasdiqlash kodi:</p>
       <p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p>
       <p style="color:#64748b">Kod ${RESET_CODE_TTL_MINUTES} daqiqa amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, shunchaki e'tibor bermang — hisobingiz xavfsiz.</p>
     </div>`
  );
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  const result = await pool.query<UserRow>(`SELECT * FROM users WHERE email = $1`, [email]);
  const user = result.rows[0];
  if (!user || !user.password_reset_code_hash || !user.password_reset_expires_at) {
    throw new UnauthorizedError("Kod noto'g'ri yoki muddati o'tgan");
  }
  if (new Date(user.password_reset_expires_at).getTime() < Date.now()) {
    throw new UnauthorizedError("Kod muddati o'tgan — qaytadan so'rang");
  }
  const matches = await bcrypt.compare(code, user.password_reset_code_hash);
  if (!matches) {
    throw new UnauthorizedError("Kod noto'g'ri");
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await pool.query(
    `UPDATE users SET password_hash = $2, password_reset_code_hash = NULL, password_reset_expires_at = NULL WHERE id = $1`,
    [user.id, newHash]
  );
}

export function refreshAccessToken(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as { userId: string };
    return payload.userId;
  } catch {
    throw new UnauthorizedError("Refresh token yaroqsiz");
  }
}
