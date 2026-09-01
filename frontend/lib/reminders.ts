import { RecurringPayment } from "./api";

export function daysInMonth(date: Date = new Date()): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** Joriy oyda to'lov kunigacha necha kun qolganini hisoblaydi (o'tib ketgan bo'lsa manfiy bo'lishi mumkin). */
export function daysUntilDue(item: Pick<RecurringPayment, "dueDay">, now: Date = new Date()): number {
  const effectiveDueDay = Math.min(item.dueDay, daysInMonth(now));
  return effectiveDueDay - now.getDate();
}

/** Eslatma oynasi ichidami: bugundan to'lov kunigacha reminderDaysBefore ichida (o'tib ketmagan). */
export function isReminderDueSoon(item: RecurringPayment, now: Date = new Date()): boolean {
  if (!item.isActive) return false;
  const remaining = daysUntilDue(item, now);
  return remaining >= 0 && remaining <= item.reminderDaysBefore;
}
