export const FARM_TZ = "Africa/Kigali";

export function todayInKigali(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FARM_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function currentSession(date = new Date()): "morning" | "midday" | "evening" {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: FARM_TZ,
      hour: "2-digit",
      hour12: false,
    }).format(date),
  );
  if (hour < 11) return "morning";
  if (hour < 16) return "midday";
  return "evening";
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return next.toISOString().slice(0, 10);
}

export function daysAgo(n: number): string {
  return addDays(todayInKigali(), -n);
}

export function formatDisplayDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(y, m - 1, d));
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function sessionLabel(session: "morning" | "midday" | "evening"): string {
  if (session === "morning") return "Morning";
  if (session === "midday") return "Midday";
  return "Evening";
}
