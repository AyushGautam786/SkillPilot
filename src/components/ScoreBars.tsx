import type { Completion } from "@/lib/schemas";

interface ScoreBarsProps {
  completed: Record<string, Completion>;
  topicTitles: Record<string, string>;
}

export function ScoreBars({ completed, topicTitles }: ScoreBarsProps) {
  const entries = Object.entries(completed)
    .sort(([, a], [, b]) => a.finishedOn.localeCompare(b.finishedOn))
    .slice(-12); // Most recent 12

  const BAR_WIDTH = 28;
  const BAR_GAP = 8;
  const CHART_HEIGHT = 120;
  const CHART_PADDING = 20;
  const REF_SCORE = 4;
  const totalWidth = entries.length * (BAR_WIDTH + BAR_GAP) + CHART_PADDING * 2;

  if (entries.length === 0) return null;

  const avgScore = entries.reduce((acc, [, c]) => acc + c.score, 0) / entries.length;
  const refY = CHART_HEIGHT - (REF_SCORE / 5) * CHART_HEIGHT;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-x-auto">
        <svg
          width={Math.max(totalWidth, 300)}
          height={CHART_HEIGHT + 40}
          aria-hidden="true"
          className="block"
        >
          {/* Reference line at 4/5 */}
          <line
            x1={CHART_PADDING}
            y1={refY}
            x2={totalWidth - CHART_PADDING}
            y2={refY}
            stroke="var(--line)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text
            x={CHART_PADDING}
            y={refY - 4}
            style={{ fontSize: "11px", fill: "var(--ink-soft)", fontFamily: "var(--font-schibsted), system-ui" }}
          >
            4 of 5
          </text>

          {/* Bars */}
          {entries.map(([topicId, c], i) => {
            const barH = (c.score / 5) * CHART_HEIGHT;
            const x = CHART_PADDING + i * (BAR_WIDTH + BAR_GAP);
            const y = CHART_HEIGHT - barH;

            return (
              <g key={topicId}>
                <rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={barH}
                  fill="var(--cobalt)"
                  rx="2"
                />
                <text
                  x={x + BAR_WIDTH / 2}
                  y={CHART_HEIGHT + 16}
                  textAnchor="middle"
                  style={{ fontSize: "11px", fill: "var(--ink-soft)", fontFamily: "var(--font-schibsted), system-ui" }}
                >
                  {c.score}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Average */}
      <p className="text-ui text-[var(--ink-soft)]">
        Average score: {Math.round((avgScore / 5) * 100)} percent
      </p>

      {/* Accessible table */}
      <table className="sr-only">
        <caption>Quiz scores</caption>
        <thead>
          <tr>
            <th>Topic</th>
            <th>Score</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([topicId, c]) => (
            <tr key={topicId}>
              <td>{topicTitles[topicId] ?? topicId}</td>
              <td>{c.score} of {c.total}</td>
              <td>{c.finishedOn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
