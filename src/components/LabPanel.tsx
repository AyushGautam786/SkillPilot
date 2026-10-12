"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import type { Lab } from "@/lib/schemas";

interface LabPanelProps {
  topicId: string;
  lab: Lab;
}

export function LabPanel({ topicId, lab }: LabPanelProps) {
  const markLabDone = useStore((s) => s.markLabDone);
  const labDone = useStore((s) => s.labDone[topicId] ?? false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  function toggleStep(index: number) {
    setCheckedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(lab.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }

  function handleMarkDone() {
    markLabDone(topicId);
    showToast("Lab marked done");
  }

  return (
    <div
      className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-panel)] p-6 flex flex-col gap-4"
      aria-label="Lab exercise"
    >
      <h2 className="text-heading text-[var(--ink)]">Lab</h2>

      <p className="text-ui text-[var(--ink)]">{lab.goal}</p>

      {/* Steps checklist */}
      <ol className="flex flex-col gap-2 list-none" aria-label="Lab steps">
        {lab.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={!!checkedSteps[i]}
                onChange={() => toggleStep(i)}
                className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--cobalt)] cursor-pointer"
                aria-label={`Step ${i + 1}: ${step}`}
              />
              <span
                className={`text-ui ${checkedSteps[i] ? "line-through text-[var(--ink-soft)]" : "text-[var(--ink)]"}`}
              >
                {i + 1}. {step}
              </span>
            </label>
          </li>
        ))}
      </ol>

      {/* Code block */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-small text-[var(--ink-soft)] uppercase tracking-wide" style={{ fontSize: "11px" }}>
            {lab.language}
          </span>
          <Button
            variant="quiet"
            onClick={copyCode}
            className="text-small py-1 px-2 min-h-0"
            aria-label="Copy code to clipboard"
          >
            {copied ? "Copied" : "Copy code"}
          </Button>
        </div>
        <pre
          className="text-code bg-[var(--sunken)] rounded-[var(--radius-field)] p-4 overflow-x-auto text-[var(--ink)]"
          style={{ fontSize: "var(--text-code-size)", lineHeight: "var(--text-code-lh)" }}
        >
          <code>{lab.code}</code>
        </pre>
      </div>

      {/* Expected output */}
      <div className="flex flex-col gap-1">
        <span className="text-small text-[var(--ink-soft)]">Expected output</span>
        <pre
          className="text-code bg-[var(--sunken)] rounded-[var(--radius-field)] p-3 overflow-x-auto text-[var(--ink-soft)]"
          style={{ fontSize: "var(--text-code-size)", lineHeight: "var(--text-code-lh)" }}
        >
          {lab.expectedOutput}
        </pre>
      </div>

      {/* Mark done button */}
      <Button
        variant={labDone ? "secondary" : "primary"}
        onClick={handleMarkDone}
        disabled={labDone}
        id={`mark-lab-done-${topicId}`}
      >
        {labDone ? "Lab done" : "Mark lab done"}
      </Button>
    </div>
  );
}
