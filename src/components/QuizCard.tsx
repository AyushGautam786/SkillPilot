"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui/Toast";
import { useStore } from "@/lib/store";
import { selectCurrentTopic } from "@/lib/store";
import type { QuizQuestion } from "@/lib/schemas";

interface QuizCardProps {
  topicId: string;
  questions: QuizQuestion[];
}

export function QuizCard({ topicId, questions }: QuizCardProps) {
  const finishQuiz = useStore((s) => s.finishQuiz);
  const existing = useStore((s) => s.completed[topicId]);
  const currentTopic = useStore(selectCurrentTopic);

  const [retaking, setRetaking] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  function startRetake() {
    setRetaking(true);
    setCurrentQ(0);
    setSelected(null);
    setChecked(false);
    setScore(0);
    setFinished(false);
  }

  function handleCheck() {
    if (selected === null) return;
    setChecked(true);
    if (selected === questions[currentQ].answer) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setChecked(false);
    } else {
      finishQuiz(topicId, score);
      setFinished(true);
      showToast(`You scored ${score} out of 5.`);
    }
  }

  const q = questions[currentQ];

  // Show previous score + retake option
  if (existing && !retaking && !finished) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-heading text-[var(--ink)]">Quiz</h2>
          <p className="text-ui text-[var(--ink-soft)]">
            Previous score: {existing.score} of {existing.total}
          </p>
        </div>
        <Button variant="secondary" onClick={startRetake} id={`retake-quiz-${topicId}`}>
          Retake quiz
        </Button>
      </div>
    );
  }

  // Finished state
  if (finished) {
    const nextTopicId = currentTopic?.id;
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-heading text-[var(--ink)]">Quiz complete</h2>
        <p className="text-title text-[var(--ink)]">
          You scored {score} out of 5.
        </p>
        <div className="flex flex-wrap gap-3">
          {nextTopicId && nextTopicId !== topicId && (
            <Link
              href={`/lesson/${nextTopicId}`}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-ui font-medium rounded-[var(--radius-field)] bg-[var(--cobalt)] text-white hover:bg-[var(--cobalt-press)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)]"
            >
              Next topic
            </Link>
          )}
          <Link
            href="/route"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-ui font-medium rounded-[var(--radius-field)] bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--sunken)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)]"
          >
            Back to route
          </Link>
        </div>
      </div>
    );
  }

  const isLast = currentQ === questions.length - 1;
  const correctAnswer = questions[currentQ].answer;
  const isCorrect = checked && selected === correctAnswer;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading text-[var(--ink)]">Quiz</h2>
        <span className="text-small text-[var(--ink-soft)]" aria-live="polite">
          Question {currentQ + 1} of {questions.length}
        </span>
      </div>

      <p className="text-prose text-[var(--ink)]">{q.q}</p>

      {/* Options */}
      <div role="radiogroup" aria-label="Quiz options" className="flex flex-col gap-2">
        {q.options.map((option, i) => {
          const isSelected = selected === i;
          const isAnswerCorrect = i === correctAnswer;
          const isAnswerWrong = checked && isSelected && !isAnswerCorrect;

          let borderColor = "var(--line)";
          let bgColor = "var(--surface)";
          const textColor = "var(--ink)";

          if (checked) {
            if (isAnswerCorrect) {
              borderColor = "var(--teal)";
              bgColor = isSelected ? "var(--cobalt-wash)" : "var(--surface)";
            } else if (isSelected && !isAnswerCorrect) {
              borderColor = "var(--brick)";
              bgColor = "var(--sunken)";
            }
          } else if (isSelected) {
            borderColor = "var(--cobalt)";
            bgColor = "var(--cobalt-wash)";
          }

          return (
            <label
              key={i}
              className="flex items-start gap-3 p-3 rounded-[var(--radius-field)] border cursor-pointer"
              style={{
                borderColor,
                backgroundColor: bgColor,
                color: textColor,
                minHeight: "44px",
                transition: `border-color var(--duration-fast) var(--ease-out), background-color var(--duration-fast) var(--ease-out)`,
              }}
            >
              <input
                type="radio"
                name={`quiz-${topicId}-${currentQ}`}
                value={i}
                checked={isSelected}
                onChange={() => { if (!checked) setSelected(i); }}
                disabled={checked}
                className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--cobalt)]"
                aria-label={option}
              />
              <span className="text-ui flex-1">{option}</span>
              {checked && isAnswerCorrect && (
                <span className="text-small font-medium" style={{ color: "var(--teal)" }}>Correct</span>
              )}
              {isAnswerWrong && (
                <span className="text-small font-medium" style={{ color: "var(--brick)" }}>Wrong</span>
              )}
            </label>
          );
        })}
      </div>

      {/* Feedback */}
      {checked && (
        <div aria-live="polite" className="flex flex-col gap-1">
          {!isCorrect && (
            <p className="text-small text-[var(--brick)]">
              Not quite. The answer is {String.fromCharCode(65 + correctAnswer)}.
            </p>
          )}
          <p className="text-prose text-[var(--ink-soft)]">{q.why}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!checked ? (
          <Button
            variant="primary"
            disabled={selected === null}
            onClick={handleCheck}
            id={`check-answer-${topicId}-${currentQ}`}
          >
            Check answer
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleNext}
            id={`next-question-${topicId}-${currentQ}`}
          >
            {isLast ? "Finish quiz" : "Next question"}
          </Button>
        )}
      </div>
    </div>
  );
}
