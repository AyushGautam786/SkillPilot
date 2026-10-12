"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { showToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import type { Profile } from "@/lib/schemas";

const GOAL_SUGGESTIONS = [
  "GenAI engineer",
  "ML engineer",
  "Data analyst",
  "Full-stack + AI",
];

const LEVEL_OPTIONS = [
  { value: "starting" as const, label: "just starting" },
  { value: "basics" as const, label: "know the basics" },
  { value: "building" as const, label: "can build things" },
];

const HOURS_OPTIONS = [
  { value: 3 as const, label: "3" },
  { value: 5 as const, label: "5" },
  { value: 8 as const, label: "8" },
  { value: 12 as const, label: "12" },
];

export function OnboardingForm() {
  const router = useRouter();
  const setProfileAndRoute = useStore((s) => s.setProfileAndRoute);

  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState<Profile["level"]>("starting");
  const [hours, setHours] = useState<Profile["hoursPerWeek"]>(5);
  const [goalError, setGoalError] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSuggestion(suggestion: string) {
    setGoal(suggestion);
    setGoalError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError("");

    const trimmed = goal.trim().slice(0, 60);
    if (trimmed.length < 2) {
      setGoalError("Check the goal field. It needs 2 to 60 characters.");
      return;
    }
    setGoalError("");

    setLoading(true);
    try {
      const profile: Profile = { goal: trimmed, level, hoursPerWeek: hours };
      const res = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        setApiError(data?.error?.message ?? "Something went wrong. Try again.");
        return;
      }

      setProfileAndRoute(profile, data);
      showToast("Route built");
      router.push("/route");
    } catch {
      setApiError("Something went wrong on our side. Try again in a minute.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <h1 className="text-display text-[var(--ink)] mb-10" style={{ letterSpacing: "-0.01em" }}>
        Build your AI learning route.
      </h1>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8 max-w-[560px]">
        {/* Goal field */}
        <div className="flex flex-col gap-3">
          <TextField
            id="goal-input"
            label="I want to become a"
            value={goal}
            onChange={(e) => {
              setGoal(e.target.value.slice(0, 60));
              if (goalError) setGoalError("");
            }}
            placeholder="e.g. GenAI engineer"
            aria-required="true"
            maxLength={60}
            error={goalError}
          />
          {/* Suggestion pills */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Goal suggestions">
            {GOAL_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestion(s)}
                className={`
                  px-3 py-1.5 text-small rounded-[var(--radius-pill)] border transition-colors cursor-pointer
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)]
                  ${goal === s
                    ? "bg-[var(--cobalt-wash)] border-[var(--cobalt)] text-[var(--cobalt)]"
                    : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div className="flex flex-col gap-2">
          <span className="text-ui text-[var(--ink)] font-medium" id="level-label">
            I&apos;m
          </span>
          <SegmentedControl
            name="level"
            value={level}
            onChange={setLevel}
            options={LEVEL_OPTIONS}
            label="Your current level"
          />
        </div>

        {/* Hours */}
        <div className="flex flex-col gap-2">
          <span className="text-ui text-[var(--ink)] font-medium">
            I can study
          </span>
          <div className="flex items-center gap-3">
            <SegmentedControl
              name="hours"
              value={hours}
              onChange={setHours}
              options={HOURS_OPTIONS}
              label="Hours per week"
            />
            <span className="text-ui text-[var(--ink-soft)]">hours a week</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-2">
          <Button type="submit" loading={loading} variant="primary" id="build-route-btn">
            Build my route
          </Button>
          {apiError && (
            <p className="text-small text-[var(--brick)]" role="alert">
              {apiError}
            </p>
          )}
        </div>
      </form>

      {/* Loading skeleton — route preview */}
      {loading && (
        <div className="mt-10 flex flex-col gap-3 max-w-[320px]" aria-live="polite" aria-label="Building your route">
          <Skeleton variant="line" height="24px" width="60%" />
          <Skeleton variant="line" height="18px" />
          <Skeleton variant="line" height="18px" width="80%" />
          <Skeleton variant="line" height="24px" width="50%" className="mt-2" />
          <Skeleton variant="line" height="18px" />
          <Skeleton variant="line" height="18px" width="70%" />
        </div>
      )}
    </div>
  );
}
