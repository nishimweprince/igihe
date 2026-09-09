const MONTHS_RW = [
  "Mutarama",
  "Gashyantare",
  "Werurwe",
  "Mata",
  "Gicurasi",
  "Kamena",
  "Nyakanga",
  "Kanama",
  "Nzeri",
  "Ukwakira",
  "Ugushyingo",
  "Ukuboza",
];

const DAYS_RW = [
  "Ku cyumweru",
  "Ku wa mbere",
  "Ku wa kabiri",
  "Ku wa gatatu",
  "Ku wa kane",
  "Ku wa gatanu",
  "Ku wa gatandatu",
];

/**
 * The scrape leaves days unpadded ("2026-09-9T09:59:00+02:00"), which Date
 * rejects outright. Pad the month and day before parsing.
 */
function parseDate(iso: string): Date {
  const padded = iso.replace(
    /^(\d{4})-(\d{1,2})-(\d{1,2})/,
    (_, y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
  );
  return new Date(padded);
}

/** Normalised value for a <time dateTime> attribute. */
export function isoDate(iso: string): string {
  const d = parseDate(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toISOString();
}

export function readMinutes(body: string): number {
  const words = body.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string): string {
  const d = parseDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS_RW[d.getMonth()]} ${d.getFullYear()}`;
}

/** Dateline for the masthead, e.g. "Ku wa kabiri, 9 Nzeri 2026". */
export function formatDateline(iso: string): string {
  const d = parseDate(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${DAYS_RW[d.getDay()]}, ${formatDate(iso)}`;
}

/** Relative stamp used on story cards: "Iminota 40 ishize", "Amasaha 6 ashize". */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const then = parseDate(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((now - then) / 60000);
  if (mins < 1) return "Ubu";
  if (mins < 60) return `Iminota ${mins} ishize`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `Amasaha ${hours} ashize`;
  const days = Math.round(hours / 24);
  if (days < 7) return `Iminsi ${days} ishize`;
  return formatDate(iso);
}
