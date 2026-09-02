import nodemailer from "nodemailer";
import { env } from "../config/env";
import { ServiceUnavailableError } from "./errors";

let gmailTransport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getGmailTransport() {
  if (!gmailTransport) {
    gmailTransport = nodemailer.createTransport({
      service: "gmail",
      auth: { user: env.gmailUser, pass: env.gmailAppPassword },
    });
  }
  return gmailTransport;
}

async function sendViaGmail(to: string, subject: string, html: string): Promise<void> {
  await getGmailTransport().sendMail({
    from: `HamyonPro <${env.gmailUser}>`,
    to,
    subject,
    html,
  });
}

/**
 * Resend (https://resend.com) REST API orqali email yuboradi.
 * Node 18+ o'zining global fetch()idan foydalanadi — qo'shimcha kutubxona shart emas.
 * O'z domeningizni Resend'da tasdiqlashingiz kerak bo'ladi.
 */
async function sendViaResend(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Email yuborilmadi (${res.status}): ${text}`);
  }
}

/**
 * Ikkita usuldan biri bilan email yuboradi — qaysi biri sozlangan bo'lsa shu ishlatiladi
 * (avval Gmail, keyin Resend). Hech biri sozlanmagan bo'lsa aniq xato bilan to'xtaydi
 * (jim qolib, foydalanuvchini chalkashtirmaslik uchun).
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (env.gmailUser && env.gmailAppPassword) {
    return sendViaGmail(to, subject, html);
  }
  if (env.resendApiKey && env.emailFrom) {
    return sendViaResend(to, subject, html);
  }
  throw new ServiceUnavailableError("Email xizmati hali sozlanmagan");
}
