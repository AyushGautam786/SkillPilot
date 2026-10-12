"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Diagram } from "@/components/Diagram";
import { LabPanel } from "@/components/LabPanel";
import { QuizCard } from "@/components/QuizCard";
import { Button } from "@/components/ui/Button";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { ToastProvider } from "@/components/ui/Toast";
import { useStore, useHydrated } from "@/lib/store";
import type { Lesson } from "@/lib/schemas";

type LoadState = "loading" | "done" | "not-found" | "daily-cap" | "offline" | { error: string };

function LessonContent() {
  const params = useParams<{ topicId: string }>();
  const topicId = params?.topicId ?? "";
  const router = useRouter();
  const hydrated = useHydrated();

  const route = useStore((s) => s.route);
  const profile = useStore((s) => s.profile);
  const lessons = useStore((s) => s.lessons);
  const cacheLesson = useStore((s) => s.cacheLesson);
  const canGenerate = useStore((s) => s.canGenerateLesson);
  const incrementUsage = useStore((s) => s.incrementLessonUsage);

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [lesson, setLesson] = useState<Lesson | null>(null);

  // Derived route & topic info
  const allTopics = route?.weeks.flatMap((w) => w.topics) ?? [];
  const topic = allTopics.find((t) => t.id === topicId);
  const weekIndex = route?.weeks.findIndex((w) => w.topics.some((t) => t.id === topicId)) ?? -1;
  const topicIndexInWeek = route?.weeks[weekIndex]?.topics.findIndex((t) => t.id === topicId) ?? -1;
  const weekTopicsCount = route?.weeks[weekIndex]?.topics.length ?? 0;

  const cachedLesson = lessons[topicId] as Lesson | undefined;
  const effectiveLesson = cachedLesson ?? lesson;
  const isCapReached = !cachedLesson && !canGenerate();

  useEffect(() => {
    if (hydrated && !route) {
      router.replace("/");
    }
  }, [hydrated, route, router]);

  useEffect(() => {
    if (!hydrated || !route || !topic || cachedLesson || isCapReached) return;

    if (!profile) {
      return;
    }

    let cancelled = false;

    async function fetchLesson() {
      if (!navigator.onLine) {
        if (!cancelled) setLoadState("offline");
        return;
      }

      try {
        const res = await fetch("/api/lesson", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, topic }),
        });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setLoadState({ error: data?.error?.message ?? "The lesson could not be written this time. Try again." });
          return;
        }

        const fetched: Lesson = data;
        cacheLesson(fetched);
        incrementUsage();
        setLesson(fetched);
        setLoadState("done");
      } catch {
        if (cancelled) return;
        if (!navigator.onLine) {
          setLoadState("offline");
        } else {
          setLoadState({ error: "Something went wrong on our side. Try again in a minute." });
        }
      }
    }

    fetchLesson();

    return () => {
      cancelled = true;
    };
  }, [hydrated, route, topic, cachedLesson, isCapReached, profile, cacheLesson, incrementUsage]);

  if (!hydrated) {
    return <LessonSkeleton />;
  }

  if (!route) {
    return null;
  }

  if (!topic) {
    return (
      <PageShell>
        <div className="flex flex-col gap-4 py-12">
          <p className="text-ui text-[var(--ink)]">That topic is not in your route.</p>
          <Button variant="secondary" asChild>
            <Link href="/route">Back to route</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (isCapReached) {
    return (
      <PageShell>
        <div className="flex flex-col gap-4 py-12">
          <p className="text-ui text-[var(--ink)]">
            You have reached today&apos;s limit of 15 new lessons. Lessons you have already opened still work. New ones unlock tomorrow.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/route">Back to route</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (loadState === "offline") {
    return (
      <PageShell>
        <div className="flex flex-col gap-4 py-12">
          <p className="text-ui text-[var(--ink)]">
            You are offline. Lessons you already opened still work.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/route">Back to route</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  if (typeof loadState === "object" && "error" in loadState) {
    return (
      <PageShell>
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-panel)] p-6 flex flex-col gap-4 my-8">
          <p className="text-ui text-[var(--ink)]">{loadState.error}</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => { setLoadState("loading"); setLesson(null); }}>
              Try again
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/route">Back to route</Link>
            </Button>
          </div>
        </div>
      </PageShell>
    );
  }

  if (!effectiveLesson) {
    return (
      <PageShell>
        <div className="flex flex-col gap-6 py-8" aria-live="polite" aria-label="Writing your lesson">
          <Skeleton variant="line" height="34px" width="70%" />
          <p className="text-small text-[var(--ink-soft)]">Writing your lesson&hellip;</p>
          <SkeletonText lines={5} />
          <Skeleton variant="block" height="200px" />
          <Skeleton variant="block" height="300px" />
        </div>
      </PageShell>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)]">
      <TopBar />
      <main className="flex-1 max-w-[1120px] mx-auto w-full px-4 md:px-8 py-8">
        <h1 className="sr-only">{effectiveLesson.title}</h1>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-small text-[var(--ink-soft)] mb-6">
          <Link href="/route" className="hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)] rounded-sm">
            Route
          </Link>
          <span aria-hidden="true">/</span>
          {topic && (
            <span>
              Week {weekIndex + 1}, topic {topicIndexInWeek + 1} of {weekTopicsCount}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left: lesson content */}
          <article className="flex-1 min-w-0 flex flex-col gap-8">
            <h2 className="text-title text-[var(--ink)]">{effectiveLesson.title}</h2>

            <p
              className="text-prose text-[var(--ink)]"
              style={{ maxWidth: "62ch" }}
            >
              {effectiveLesson.explanation}
            </p>

            {/* Diagram */}
            <div className="flex flex-col gap-2">
              <Diagram source={effectiveLesson.diagram} caption={effectiveLesson.diagramCaption} />
              <p className="text-small text-[var(--ink-soft)]">{effectiveLesson.diagramCaption}</p>
            </div>

            {/* Lab — tablet/mobile only */}
            <div className="lg:hidden">
              <LabPanel topicId={topicId} lab={effectiveLesson.lab} />
            </div>

            {/* Quiz */}
            <section aria-label="Quiz" className="flex flex-col gap-4 border-t border-[var(--line)] pt-8">
              <QuizCard topicId={topicId} questions={effectiveLesson.quiz} />
            </section>
          </article>

          {/* Right: lab panel (desktop sticky) */}
          <aside
            className="hidden lg:block lg:w-[320px] shrink-0"
            aria-label="Lab exercise"
          >
            <div className="sticky" style={{ top: "calc(56px + var(--space-6))" }}>
              <LabPanel topicId={topicId} lab={effectiveLesson.lab} />
            </div>
          </aside>
        </div>
      </main>
      <ToastProvider />
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)]">
      <TopBar />
      <main className="flex-1 max-w-[1120px] mx-auto w-full px-4 md:px-8">
        {children}
      </main>
      <ToastProvider />
    </div>
  );
}

function LessonSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--paper)]">
      <header className="sticky top-0 z-40 bg-[var(--surface)] border-b border-[var(--line)] h-14" />
      <main className="flex-1 max-w-[1120px] mx-auto w-full px-4 md:px-8 py-8">
        <div className="flex flex-col gap-6">
          <Skeleton variant="line" height="34px" width="60%" />
          <SkeletonText lines={5} />
          <Skeleton variant="block" height="200px" />
          <Skeleton variant="block" height="300px" />
        </div>
      </main>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonContent />
    </Suspense>
  );
}
