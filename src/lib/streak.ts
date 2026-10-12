import { localDateString, weekStart } from "./dates";

/**
 * Computes the current streak from an array of active local date strings.
 * A streak counts consecutive days ending today.
 * If today is not active but yesterday is, the streak still counts (shown as "at risk").
 */
export function currentStreak(activeDays: string[], today: string = localDateString()): number {
  if (activeDays.length === 0) return 0;

  const daySet = new Set(activeDays);
  let streak = 0;
  let cursor = new Date(today + "T00:00:00");

  // If neither today nor yesterday is active, streak is 0
  const yesterday = new Date(cursor);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = localDateString(yesterday);

  if (!daySet.has(today) && !daySet.has(yesterdayStr)) {
    return 0;
  }

  // Start counting from yesterday if today is not yet active
  if (!daySet.has(today)) {
    cursor = yesterday;
  }

  while (daySet.has(localDateString(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

/**
 * Returns true if today is active (used to determine "at risk" status).
 */
export function isTodayActive(activeDays: string[], today: string = localDateString()): boolean {
  return activeDays.includes(today);
}

export interface DayCell {
  date: string; // YYYY-MM-DD
  label: string; // "M", "T", "W" etc.
  active: boolean;
  isToday: boolean;
}

/**
 * Returns seven cells Mon–Sun for the week containing `today`.
 */
export function weekStrip(activeDays: string[], today: string = localDateString()): DayCell[] {
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const daySet = new Set(activeDays);
  const todayDate = new Date(today + "T00:00:00");
  const monday = weekStart(todayDate);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = localDateString(d);
    return {
      date: dateStr,
      label: dayLabels[i],
      active: daySet.has(dateStr),
      isToday: dateStr === today,
    };
  });
}
