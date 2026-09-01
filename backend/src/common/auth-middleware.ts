import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { pool } from "../config/db";
import { UnauthorizedError } from "./errors";

export interface AuthPayload {
  userId: string;
  plan: "free" | "pro";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token topilmadi");
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    throw new UnauthorizedError("Token yaroqsiz yoki muddati o'tgan");
  }
}

/**
 * Pro holatini JWT'dagi eski claim'dan emas, bazadan tekshiradi.
 * Sabab: endi Pro referal orqali ochiladi — bu boshqa foydalanuvchining
 * (do'stining) ro'yxatdan o'tishi natijasida sodir bo'ladi, ya'ni
 * referrer'ning o'zi hech narsa qilmasa ham uning bazadagi plan'i o'zgaradi.
 * Uning eski JWT'si esa yangi token olmaguncha "free" claim'ini ko'tarib yuradi.
 */
export async function requirePro(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) {
    throw new UnauthorizedError("Token topilmadi");
  }
  const result = await pool.query<{ plan: "free" | "pro" }>(`SELECT plan FROM users WHERE id = $1`, [
    req.auth.userId,
  ]);
  if (result.rows[0]?.plan !== "pro") {
    throw new UnauthorizedError("Bu funksiya faqat Pro obuna uchun");
  }
  next();
}

/**
 * Admin roli hech qachon JWT ichiga qo'yilmaydi (rol o'zgarishi juda kam va
 * xavfsizlik jihatidan muhim — shuning uchun har doim bazadan real vaqtda
 * tekshiriladi, eskirgan token orqali admin huquqi "qolib ketmasligi" uchun).
 */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) {
    throw new UnauthorizedError("Token topilmadi");
  }
  const result = await pool.query<{ role: "user" | "admin" }>(`SELECT role FROM users WHERE id = $1`, [
    req.auth.userId,
  ]);
  if (result.rows[0]?.role !== "admin") {
    throw new UnauthorizedError("Bu funksiya faqat administrator uchun");
  }
  next();
}
