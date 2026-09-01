export function formatSom(amount: number, lang: "uz" | "ru" = "uz"): string {
  const formatted = new Intl.NumberFormat("uz-UZ").format(Math.round(amount));
  return lang === "ru" ? `${formatted} сум` : `${formatted} so'm`;
}

export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const UZ_MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr",
];

const RU_MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export function monthLabel(month: string, lang: "uz" | "ru" = "uz"): string {
  const [year, m] = month.split("-").map(Number);
  const list = lang === "ru" ? RU_MONTHS : UZ_MONTHS;
  const name = list[(m ?? 1) - 1] ?? month;
  return `${name} ${year}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 1970, (m ?? 1) - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}
