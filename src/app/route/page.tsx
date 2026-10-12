"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useStore,
  useHydrated,
  selectCurrentTopic,
  selectCompletedCount,
  selectTotalTopicCount,
  selectAverageScore,
  selectCurrentWeek,
} from "@/lib/store";

function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3.5a7.5 7.5 0 0 0-4.7 13.35L12 20.5l4.7-3.65A7.5 7.5 0 0 0 12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="11" r="2.2" fill="currentColor" />
      </svg>
    </span>
  );
}

export default function RoutePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const route = useStore((s) => s.route);
  const profile = useStore((s) => s.profile);
  const completed = useStore((s) => s.completed);
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

  function handleNewRoute() {
    if (confirm("This deletes your current route, scores and streak from this browser. Continue?")) {
      resetAll();
      router.push("/");
    }
  }

  if (!hydrated) {
    return (
      <main>
        <div className="shell">
          <header className="topbar">
            <Link href="/" className="brand">
              <Mark /> SkillPilot
            </Link>
          </header>
        </div>
        <section className="shell dashboard">
          <div className="dashboard-head">
            <div>
              <div className="eyebrow">Your learning route</div>
              <h1>Loading your route...</h1>
            </div>
          </div>
          <div className="dashboard-grid">
            <section className="panel" style={{ minHeight: "340px", opacity: 0.6 }}>
              <div className="card-kicker">Loading</div>
              <p>Preparing your learning workspace...</p>
            </section>
            <aside className="panel" style={{ minHeight: "340px", opacity: 0.6 }}>
              <div className="card-kicker">Route progress</div>
            </aside>
          </div>
        </section>
      </main>
    );
  }

  if (!route) return null;

  const allDone = completedCount >= totalCount && totalCount > 0;
  const allTopics = route.weeks.flatMap((w) =>
    w.topics.map((t) => ({ ...t, weekNumber: w.week }))
  );

  return (
    <main>
      <div className="shell">
        <header className="topbar">
          <Link href="/" className="brand">
            <Mark /> SkillPilot
          </Link>
          <nav className="nav">
            <button
              type="button"
              onClick={handleNewRoute}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                color: "inherit",
                cursor: "pointer",
              }}
            >
              Change route
            </button>
            <Link href="/progress" className="nav-cta">
              Your progress
            </Link>
          </nav>
        </header>
      </div>

      <section className="shell dashboard">
        <div className="dashboard-head">
          <div>
            <div className="eyebrow">Your learning route</div>
            <h1>{profile?.goal ?? route.goal}</h1>
          </div>
          <button
            type="button"
            className="back-link"
            onClick={handleNewRoute}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
            }}
          >
            ← Build another route
          </button>
        </div>

        <div className="dashboard-grid">
          {/* Main Action Panel */}
          <section className="panel">
            {allDone ? (
              <div>
                <div className="card-kicker">Route Completed</div>
                <h2>You finished your learning route!</h2>
                <p>
                  You completed all {totalCount} topics with an average quiz score of{" "}
                  {avgScore}%.
                </p>
                <div className="lesson-callout" style={{ marginTop: "24px" }}>
                  <div>
                    <strong>View your achievements & streak</strong>
                    <p>Review quiz stats and topics studied</p>
                  </div>
                  <Link className="primary-btn" href="/progress">
                    See progress
                  </Link>
                </div>
              </div>
            ) : currentTopic ? (
              <div>
                <div className="card-kicker">
                  This week · 0{currentWeek?.week ?? 1}
                </div>
                <h2>{currentWeek?.theme ?? "Core Foundations"}</h2>
                <p>{currentTopic.why}</p>

                <div className="lesson-callout">
                  <div>
                    <strong>{currentTopic.title}</strong>
                    <p>15 min lesson · followed by a hands-on lab & quiz</p>
                  </div>
                  <Link className="primary-btn" href={`/lesson/${currentTopic.id}`}>
                    Start lesson
                  </Link>
                </div>
              </div>
            ) : null}

            <div className="stats">
              <div className="stat">
                <strong>{String(completedCount).padStart(2, "0")}</strong>
                <span>topics complete</span>
              </div>
              <div className="stat">
                <strong>15m</strong>
                <span>today&apos;s focus</span>
              </div>
              <div className="stat">
                <strong>{route.weeks.length}</strong>
                <span>week route</span>
              </div>
            </div>
          </section>

          {/* Route Progress Sidebar */}
          <aside id="progress" className="panel">
            <div className="card-kicker">Route progress</div>
            <ul className="side-list">
              {allTopics.map((item, idx) => {
                const isDone = Boolean(completed[item.id]);
                const isCurrent = item.id === currentTopic?.id;
                let statusLabel = "Later";
                if (isDone) statusLabel = "Complete";
                else if (isCurrent) statusLabel = "Today";
                else if (idx === completedCount + 1) statusLabel = "Next";

                return (
                  <li key={item.id}>
                    <Link
                      href={`/lesson/${item.id}`}
                      style={{
                        color: "inherit",
                        textDecoration: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <span style={{ maxWidth: "200px" }}>
                        <strong
                          style={{
                            color: isCurrent ? "var(--moss)" : "inherit",
                          }}
                        >
                          {item.title}
                        </strong>
                        <br />
                        <small style={{ color: "var(--muted)" }}>{item.why}</small>
                      </span>
                      <span
                        className={isDone ? "check" : ""}
                        style={{
                          color: isCurrent ? "var(--sun)" : undefined,
                          fontWeight: isCurrent ? 700 : undefined,
                        }}
                      >
                        {statusLabel}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </section>

      <footer className="shell footer">
        <p>Keep the route small. Keep the practice real.</p>
        <Link className="text-link" href="/">
          Back to SkillPilot
        </Link>
      </footer>
    </main>
  );
}
