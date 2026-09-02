import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "30d",
  // Ixtiyoriy: parolni tiklash kodini emailga yuborish uchun. Ikkita usuldan biri ishlatiladi
  // (Gmail sozlangan bo'lsa — shu, aks holda Resend). Hech biri sozlanmagan bo'lsa, shu funksiya
  // "email xizmati sozlanmagan" xatosini qaytaradi, lekin serverning qolgan qismi ishlayveradi.
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || "",
  gmailUser: process.env.GMAIL_USER || "",
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || "",
};
