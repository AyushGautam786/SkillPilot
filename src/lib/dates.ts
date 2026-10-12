/**
 * Returns YYYY-MM-DD in the user's local time zone.
 */
export function localDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns the Monday of the week containing the given date.
 */
export function weekStart(d: Date = new Date()): Date {
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Returns the day-of-week index for Monday-based weeks (Mon=0, Sun=6).
 */
export function mondayIndex(d: Date): number {
  const day = d.getDay(); // 0=Sun, 1=Mon...
  return day === 0 ? 6 : day - 1;
}
