"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore, useHydrated, selectCurrentTopic } from "@/lib/store";

const goals = ["GenAI engineer", "ML engineer", "Data analyst", "Full-stack + AI"];
const levels = ["Just starting", "Know the basics", "Can build things"];
const hours = ["3 hours", "5 hours", "8 hours", "12 hours"];

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

function Header({ hasRoute }: { hasRoute: boolean }) {
  return (
    <header className="topbar">
      <Link href="/" className="brand">
        <Mark /> SkillPilot
      </Link>
      <nav className="nav">
        <a href="#how-it-works">How it works</a>
        <a href="#build">Build a route</a>
        {hasRoute ? (
          <Link href="/route" className="nav-cta">
            Continue route
          </Link>
        ) : (
          <a href="#build" className="nav-cta">
            Start learning
          </a>
        )}
      </nav>
    </header>
  );
}

function RoutePreview() {
  const route = useStore((s) => s.route);
  const profile = useStore((s) => s.profile);
  const completed = useStore((s) => s.completed);
  const currentTopic = useStore(selectCurrentTopic);

  // If user already has a route in local storage, display their actual route
  if (route && route.weeks.length > 0) {
    const allTopics = route.weeks.flatMap((w) =>
      w.topics.map((t) => ({ ...t, week: w.week }))
    );
    const completedCount = Object.keys(completed).length;

    return (
      <div className="route-card">
        <div className="route-top">
          <div>
            <small>Your active route</small>
            <strong>{profile?.goal ?? route.goal}</strong>
          </div>
          <span className="progress-pill">
            {completedCount} of {allTopics.length} complete
          </span>
        </div>
        {allTopics.slice(0, 4).map((topic) => {
          const isDone = !!completed[topic.id];
          const isCurrent = topic.id === currentTopic?.id;
          const stateClass = isDone ? "done" : isCurrent ? "current" : "";

          return (
            <div className={`route-item ${stateClass}`} key={topic.id}>
              <span className="route-dot" aria-hidden="true" />
              <div>
                <h3>{topic.title}</h3>
                <p>{topic.why}</p>
              </div>
              <time>Week 0{topic.week}</time>
            </div>
          );
        })}
      </div>
    );
  }

  // Otherwise display the sample route preview
  const sampleItems = [
    ["Foundations", "How modern AI systems fit together", "Week 01", "done"],
    ["The model layer", "Tokens, embeddings and context", "Week 02", "current"],
    ["Build with APIs", "Your first useful AI feature", "Week 03", ""],
    ["Ship the system", "Evaluation, safety and deployment", "Week 04", ""],
  ];

  return (
    <div className="route-card">
      <div className="route-top">
        <div>
          <small>Sample route</small>
          <strong>GenAI engineer</strong>
        </div>
        <span className="progress-pill">1 of 4 complete</span>
      </div>
      {sampleItems.map(([title, desc, time, state]) => (
        <div className={`route-item ${state}`} key={title}>
          <span className="route-dot" aria-hidden="true" />
          <div>
            <h3>{title}</h3>
            <p>{desc}</p>
          </div>
          <time>{time}</time>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const route = useStore((s) => s.route);
  const setProfileAndRoute = useStore((s) => s.setProfileAndRoute);

  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState(levels[0]);
  const [studyHours, setStudyHours] = useState(hours[1]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = goal.trim();
    if (!trimmed || trimmed.length < 2) {
      setError("Please describe what role you want to learn (2 to 60 characters).");
      return;
    }

    setSubmitting(true);
    setError(null);

    const levelMap: Record<string, "starting" | "basics" | "building"> = {
      "Just starting": "starting",
      "Know the basics": "basics",
      "Can build things": "building",
    };
    const hoursMap: Record<string, 3 | 5 | 8 | 12> = {
      "3 hours": 3,
      "5 hours": 5,
      "8 hours": 8,
      "12 hours": 12,
    };

    const mappedLevel = levelMap[level] ?? "starting";
    const mappedHours = hoursMap[studyHours] ?? 5;
    const finalGoal = trimmed.slice(0, 60);

    try {
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: finalGoal,
          level: mappedLevel,
          hoursPerWeek: mappedHours,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error?.message ?? "The route could not be generated. Please try again.");
        setSubmitting(false);
        return;
      }

      setProfileAndRoute(
        { goal: finalGoal, level: mappedLevel, hoursPerWeek: mappedHours },
        data
      );
      router.push("/route");
    } catch {
      setError("Something went wrong communicating with the server. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const hasRoute = Boolean(hydrated && route);

  return (
    <main>
      <div className="shell">
        <Header hasRoute={hasRoute} />
      </div>

      <section className="shell hero">
        <div>
          <div className="eyebrow">A better way to learn technical skills</div>
          <h1>
            Make progress you can <em>see.</em>
          </h1>
          <p className="hero-copy">
            SkillPilot turns a career goal into a clear weekly route — with short lessons,
            hands-on practice, and just enough structure to keep moving.
          </p>
          <div className="hero-actions">
            {hasRoute ? (
              <Link className="primary-btn" href="/route">
                Continue my learning route
              </Link>
            ) : (
              <a className="primary-btn" href="#build">
                Build my learning route
              </a>
            )}
            <a className="text-link" href="#how-it-works">
              See how it works
            </a>
          </div>
        </div>
        <RoutePreview />
      </section>

      <div className="shell">
        <div className="intro-band">
          <p>
            <strong>Less tab-hopping.</strong> More deliberate practice.
          </p>
          <span>Designed for busy engineering students</span>
        </div>
      </div>

      <section id="how-it-works" className="shell section">
        <div className="section-heading">
          <h2>A study plan that respects how learning actually works.</h2>
          <p>Small, focused steps create the confidence to take on bigger systems.</p>
        </div>
        <div className="feature-grid">
          <article className="feature">
            <span className="feature-num">01</span>
            <h3>Start with a direction</h3>
            <p>
              Tell us the role you are working toward, where you are today, and how much
              time you can give it.
            </p>
          </article>
          <article className="feature">
            <span className="feature-num">02</span>
            <h3>Follow your route</h3>
            <p>
              Get a week-by-week sequence of concepts that builds from first principles to
              real engineering decisions.
            </p>
          </article>
          <article className="feature">
            <span className="feature-num">03</span>
            <h3>Learn by doing</h3>
            <p>
              Finish each topic with a lab and a quick check for understanding. Your route
              gets smarter as you do.
            </p>
          </article>
        </div>
      </section>

      <section id="build" className="form-section">
        <div className="shell form-layout">
          <div className="form-copy">
            <div className="eyebrow">Your next chapter</div>
            <h2>Where would you like your skills to take you?</h2>
            <p>
              No profile, comparison, or noisy course catalogue. Just a starting point for
              a route that fits your pace.
            </p>
          </div>

          <form className="form-card" onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="goal">
              I want to become a
            </label>
            <input
              id="goal"
              className="text-input"
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              placeholder="e.g. GenAI engineer"
              maxLength={60}
              required
            />

            <span className="option-label">Or choose a starting point</span>
            <div className="option-row">
              {goals.map((item) => (
                <button
                  type="button"
                  className={`option ${goal === item ? "selected" : ""}`}
                  onClick={() => setGoal(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>

            <span className="option-label">I&apos;m currently...</span>
            <div className="option-row">
              {levels.map((item) => (
                <button
                  type="button"
                  className={`option ${level === item ? "selected" : ""}`}
                  onClick={() => setLevel(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>

            <span className="option-label">I can study each week</span>
            <div className="option-row">
              {hours.map((item) => (
                <button
                  type="button"
                  className={`option ${studyHours === item ? "selected" : ""}`}
                  onClick={() => setStudyHours(item)}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>

            {error && (
              <p
                role="alert"
                style={{
                  color: "var(--clay)",
                  fontSize: "13px",
                  marginTop: "16px",
                  fontWeight: 500,
                }}
              >
                {error}
              </p>
            )}

            <button
              className="primary-btn form-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Building your learning route..." : "Build my learning route"}
            </button>

            <p className="form-note">
              Your route stays in this browser. No account needed to begin.
            </p>
          </form>
        </div>
      </section>

      <footer className="shell footer">
        <p>© 2026 SkillPilot</p>
        <p>Built for curious people who keep showing up.</p>
      </footer>
    </main>
  );
}
