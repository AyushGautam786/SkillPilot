"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { RouteLine } from "@/components/RouteLine";
import { WeekStrip } from "@/components/WeekStrip";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastProvider } from "@/components/ui/Toast";
import {
  useStore,
  useHydrated,
  selectCurrentTopic,
  selectCompletedCount,
  selectTotalTopicCount,
  selectAverageScore,
  selectCurrentWeek,
} from "@/lib/store";
import { currentStreak, weekStrip, isTodayActive } from "@/lib/streak";
import { localDateString } from "@/lib/dates";

export default function RoutePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const route = useStore((s) => s.route);
  const completed = useStore((s) => s.completed);
  const routeDrawn = useStore((s) => s.routeDrawn);
  const activeDays = useStore((s) => s.activeDays);
  const resetAll = useStore((s) => s.resetAll);

  const currentTopic = useStore(selectCurrentTopic);
  const completedCount = useStore(selectCompletedCount);
  const totalCount = useStore(selectTotalTopicCount);
  const avgScore = useStore(selectAverageScore);
  const currentWeek = useStore(selectCurrentWeek);

  useEffect(() => {
    if (hydrated && !route) {
      router.replace("/");
    }
  }, [hydrated, route, router]);

  const handleDrawn = useCallback(() => {
    if (route) {
      // Mark route as drawn by updating the store
      useStore.setState({ routeDrawn: true });
    }
  }, [route]);

  function handleNewRoute() {
    if (confirm("This deletes your current route, scores and streak from this browser. Continue?")) {
      resetAll();
      router.push("/");
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--paper)]">
        <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--line)] h-14" />
        <main className="flex-1 max-w-[1120px] mx-auto w-full px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
            <div className="flex flex-col gap-4">
              <Skeleton variant="line" height="20px" width="50%" />
              <Skeleton variant="line" height="40px" width="80%" />
              <Skeleton variant="line" height="20px" />
              <Skeleton variant="line" height="44px" width="160px" className="mt-2" />
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton variant="block" height="400px" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!route) return null;

  const today = localDateString();
  const streak = currentStreak(activeDays, today);
  const strip = weekStrip(activeDays, today);
  const todayActive = isTodayActive(activeDays, today);
  const allDone = completedCount >= totalCount && totalCount > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)]">
      <TopBar />
      <main className="flex-1 max-w-[1120px] mx-auto w-full px-4 md:px-8 py-8">
        <h1 className="sr-only">Your learning route</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: Today panel */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {allDone ? (
              /* Route finished state */
              <div className="flex flex-col gap-4">
                <h2 className="text-title text-[var(--ink)]">Route finished</h2>
                <p className="text-ui text-[var(--ink-soft)]">
                  You completed {totalCount} topics with an average quiz score of {avgScore} percent.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" asChild>
                    <Link href="/progress">See progress</Link>
                  </Button>
                  <Button variant="secondary" onClick={handleNewRoute}>
                    Build a new route
                  </Button>
                </div>
              </div>
            ) : currentTopic ? (
              /* Current topic panel */
              <div className="flex flex-col gap-4">
                {currentWeek && (
                  <p className="text-small text-[var(--ink-soft)]">
                    Week {currentWeek.week} of {route.weeks.length}: {currentWeek.theme}
                  </p>
                )}
                <h2 className="text-display text-[var(--ink)]">{currentTopic.title}</h2>
                <p className="text-prose text-[var(--ink-soft)]">{currentTopic.why}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <Button variant="primary" asChild id="start-lesson-btn">
                    <Link href={`/lesson/${currentTopic.id}`}>Start lesson</Link>
                  </Button>
                  <span className="text-small text-[var(--ink-soft)]">about 15 minutes</span>
                </div>
              </div>
            ) : null}

            {/* Week strip */}
            <div className="flex flex-col gap-2">
              <WeekStrip days={strip} />
              {streak > 0 && !todayActive && (
                <p className="text-small text-[var(--ink-soft)]">
                  Do one topic today to keep your {streak}-day streak.
                </p>
              )}
              {streak === 0 && (
                <p className="text-small text-[var(--ink-soft)]">Start your streak today.</p>
              )}
            </div>
          </div>

          {/* Right: Route line */}
          <div className="lg:w-[300px] shrink-0">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-panel)] p-4">
              <RouteLine
                route={route}
                completed={completed}
                currentTopicId={currentTopic?.id ?? null}
                routeDrawn={routeDrawn}
                onDrawn={handleDrawn}
              />
            </div>
          </div>
        </div>
      </main>
      <ToastProvider />
    </div>
  );
}
