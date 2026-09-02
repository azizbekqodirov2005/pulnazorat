import { env } from "../config/env";
import { ServiceUnavailableError } from "./errors";

/**
 * Resend (https://resend.com) REST API orqali email yuboradi.
 * Node 18+ o'zining global fetch()idan foydalanadi — qo'shimcha kutubxona shart emas.
 * RESEND_API_KEY va EMAIL_FROM environment o'zgaruvchilari sozlanmagan bo'lsa,
 * aniq xato bilan to'xtaydi (jim qolib, foydalanuvchini chalkashtirmaslik uchun).
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.resendApiKey || !env.emailFrom) {
    throw new ServiceUnavailableError("Email xizmati hali sozlanmagan");
  }

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
