export const locales = ["en", "bn"] as const;
export type Locale = typeof locales[number];
export type Localized = Record<Locale, string>;
export const months = Array.from({ length: 12 }, (_, i) => i + 1);
export const pad = (value: number) => String(value).padStart(2, "0");
export const dateKey = (month: number, day: number) => pad(month) + "-" + pad(day);
export const isLocale = (value: string): value is Locale => locales.some(locale => locale === value);
export const choose = (locale: Locale, en: string, bn: string) => locale === "bn" ? bn : en;
const numbers = { en: new Intl.NumberFormat("en", { useGrouping: false }), bn: new Intl.NumberFormat("bn", { useGrouping: false }) };
const dateFormatter = (locale: Locale) => new Intl.DateTimeFormat(locale, { month: "long", day: "numeric", timeZone: "UTC" });
const dates = { en: dateFormatter("en"), bn: dateFormatter("bn") };
export const number = (locale: Locale, value: number) => numbers[locale].format(value);
export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();
export const isDateKey = (value: string) => {
  if (!/^\d{2}-\d{2}$/.test(value)) return false;
  const [month, day] = value.split("-").map(Number);
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(2000, month);
};
export const allDates = months.flatMap(m => Array.from({ length: daysInMonth(2000, m) }, (_, i) => dateKey(m, i + 1)));
export const monthLabel = (locale: Locale, month: number, style: "long" | "short" = "long") =>
  new Intl.DateTimeFormat(locale, { month: style, timeZone: "UTC" }).format(new Date(Date.UTC(2000, month - 1)));
export function formatDate(locale: Locale, key: string) {
  const [month, day] = key.split("-").map(Number);
  return dates[locale].format(new Date(Date.UTC(2000, month - 1, day)));
}
export function today(timeZone = "Asia/Dhaka", now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone }).formatToParts(now);
  const part = (type: string) => Number(parts.find(item => item.type === type)?.value);
  const year = part("year"), month = part("month"), day = part("day");
  return { year, month, day, key: dateKey(month, day) };
}
export function shiftDate(year: number, key: string, offset: number) {
  const [month, day] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return { year: date.getUTCFullYear(), key: dateKey(date.getUTCMonth() + 1, date.getUTCDate()) };
}
export const dayHref = (locale: Locale, key: string, year?: number) => "/" + locale + "/day/" + key + (year ? "?year=" + year : "");
export const storyHref = (locale: Locale, slug: string) => "/" + locale + "/observance/" + slug;
export const weekdayLabels = (locale: Locale) => Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, 1 + index))));
