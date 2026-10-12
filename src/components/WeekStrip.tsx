import type { DayCell } from "@/lib/streak";

interface WeekStripProps {
  days: DayCell[];
}

export function WeekStrip({ days }: WeekStripProps) {
  return (
    <div
      className="flex gap-1"
      role="group"
      aria-label="Activity this week"
    >
      {days.map((day) => (
        <div key={day.date} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          {/* Day indicator */}
          <div
            className="w-7 h-7 flex items-center justify-center"
            aria-label={`${getDayName(day.date)}, ${day.active ? "active" : "no activity"}${day.isToday ? ", today" : ""}`}
          >
            <div
              className={`w-5 h-5 rounded-[var(--radius-pill)] flex items-center justify-center`}
              style={{
                background: day.active ? "var(--ink)" : "transparent",
                border: day.isToday
                  ? "2px solid var(--cobalt)"
                  : day.active
                    ? "none"
                    : "2px solid var(--line)",
              }}
            >
              {day.active && !day.isToday && (
                <span
                  className="w-2 h-2 rounded-full bg-[var(--surface)]"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
          {/* Day letter */}
          <span className="text-small text-[var(--ink-soft)]" aria-hidden="true">
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function getDayName(dateStr: string): string {
  const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return names[new Date(dateStr + "T00:00:00").getDay()];
}
