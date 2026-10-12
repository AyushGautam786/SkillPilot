"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore, useHydrated } from "@/lib/store";
import { currentStreak } from "@/lib/streak";
import { localDateString } from "@/lib/dates";

export function TopBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const activeDays = useStore((s) => s.activeDays);
  const route = useStore((s) => s.route);

  const streak = hydrated ? currentStreak(activeDays, localDateString()) : 0;

  return (
    <header
      className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--line)]"
      role="banner"
    >
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-[var(--ink)] font-bold text-ui hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)] shrink-0"
          style={{ fontSize: "17px", letterSpacing: "-0.01em" }}
        >
          SkillPilot
        </Link>

        {/* Nav + streak in a single row */}
        <nav className="flex items-center gap-4 sm:gap-6" aria-label="Main navigation">
          {route && (
            <>
              <NavLink href="/route" current={pathname === "/route"}>
                Route
              </NavLink>
              <NavLink href="/progress" current={pathname === "/progress"}>
                Progress
              </NavLink>
            </>
          )}

          {/* Streak */}
          {hydrated && (
            <div className="flex items-center gap-1.5 text-small text-[var(--ink-soft)] shrink-0" aria-label={streak > 0 ? `${streak}-day streak` : "No streak yet"}>
              {streak > 0 ? (
                <>
                  <span
                    className="w-2 h-2 rounded-none shrink-0"
                    style={{ background: "var(--marigold)", width: "8px", height: "8px" }}
                    aria-hidden="true"
                  />
                  <span className="text-[var(--ink)] font-medium">Streak {streak} day{streak !== 1 ? "s" : ""}</span>
                </>
              ) : (
                <span>No streak yet</span>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={`text-ui transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)] ${
        current
          ? "text-[var(--ink)] font-semibold"
          : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
      }`}
    >
      {children}
    </Link>
  );
}
