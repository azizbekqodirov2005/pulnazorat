export function formatSom(amount: number): string {
  return new Intl.NumberFormat("uz-UZ").format(Math.round(amount)) + " so'm";
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

export function monthLabel(month: string): string {
  const [year, m] = month.split("-").map(Number);
  const name = UZ_MONTHS[(m ?? 1) - 1] ?? month;
  return `${name} ${year}`;
}
