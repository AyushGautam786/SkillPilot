"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { WeekStrip } from "@/components/WeekStrip";
import { ScoreBars } from "@/components/ScoreBars";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ToastProvider } from "@/components/ui/Toast";
import {
  useStore,
  useHydrated,
  selectCurrentTopic,
  selectCompletedCount,
  selectTotalTopicCount,
} from "@/lib/store";
import { currentStreak, weekStrip } from "@/lib/streak";
import { localDateString } from "@/lib/dates";

export default function ProgressPage() {
  const hydrated = useHydrated();
  const router = useRouter();

  const route = useStore((s) => s.route);
  const completed = useStore((s) => s.completed);
  const activeDays = useStore((s) => s.activeDays);
  const resetAll = useStore((s) => s.resetAll);
  const currentTopic = useStore(selectCurrentTopic);
  const completedCount = useStore(selectCompletedCount);
  const totalCount = useStore(selectTotalTopicCount);

  function handleReset() {
    if (confirm("This deletes your route, scores and streak from this browser.")) {
      resetAll();
      router.push("/");
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--paper)]">
        <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--line)] h-14" />
        <main className="flex-1 max-w-[1120px] mx-auto w-full px-4 md:px-8 py-8">
          <div className="flex flex-col gap-6 max-w-[640px]">
            <Skeleton variant="line" height="28px" width="60%" />
            <Skeleton variant="line" height="28px" width="40%" />
            <Skeleton variant="block" height="140px" />
            <Skeleton variant="block" height="120px" />
          </div>
        </main>
      </div>
    );
  }

  const today = localDateString();
  const streak = currentStreak(activeDays, today);
  const strip = weekStrip(activeDays, today);

  // Build topic title map
  const allTopics = route?.weeks.flatMap((w) => w.topics) ?? [];
  const topicTitles: Record<string, string> = {};
  allTopics.forEach((t) => { topicTitles[t.id] = t.title; });

  const completedEntries = Object.entries(completed).sort(([, a], [, b]) =>
    b.finishedOn.localeCompare(a.finishedOn)
  );
  const hasScores = completedEntries.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)]">
      <TopBar />
      <main className="flex-1 max-w-[1120px] mx-auto w-full px-4 md:px-8 py-8">
        <h1 className="sr-only">Progress</h1>

        <div className="flex flex-col gap-8 max-w-[640px]">
          {/* Headline stats */}
          <div className="flex flex-col gap-1">
            <p className="text-heading text-[var(--ink)]">
              {streak > 0 ? `${streak}-day streak.` : "No streak yet."}
            </p>
            <p className="text-heading text-[var(--ink)]">
              {completedCount} of {totalCount} topics done.
            </p>
          </div>

          {/* Week strip */}
          <WeekStrip days={strip} />

          {/* Score bars or empty state */}
          {hasScores ? (
            <section aria-label="Quiz scores">
              <ScoreBars completed={completed} topicTitles={topicTitles} />
            </section>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-ui text-[var(--ink-soft)]">
                No quiz scores yet. Finish a quiz and your scores show up here.
              </p>
              {currentTopic && (
                <Button variant="primary" asChild>
                  <Link href={`/lesson/${currentTopic.id}`}>Go to today&apos;s topic</Link>
                </Button>
              )}
            </div>
          )}

          {/* Finished topics list */}
          {hasScores && (
            <section aria-label="Finished topics">
              <h2 className="text-heading text-[var(--ink)] mb-4">Finished topics</h2>
              <ul className="flex flex-col gap-3">
                {completedEntries.map(([topicId, c]) => (
                  <li
                    key={topicId}
                    className="flex items-center justify-between gap-4 py-3 border-b border-[var(--line)]"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-ui text-[var(--ink)] font-medium truncate">
                        {topicTitles[topicId] ?? topicId}
                      </span>
                      <span className="text-small text-[var(--ink-soft)]">
                        {c.score} of {c.total} &bull; {c.finishedOn}
                      </span>
                    </div>
                    <Link
                      href={`/lesson/${topicId}`}
                      className="text-small text-[var(--cobalt)] hover:text-[var(--cobalt-press)] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)] rounded-sm"
                    >
                      Review lesson
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Reset */}
          <div className="border-t border-[var(--line)] pt-6">
            <Button variant="quiet" onClick={handleReset} id="reset-all-btn">
              Reset all data
            </Button>
          </div>
        </div>
      </main>
      <ToastProvider />
    </div>
  );
}
