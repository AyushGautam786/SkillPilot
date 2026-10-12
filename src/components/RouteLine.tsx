"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Route } from "@/lib/schemas";
import type { Completion } from "@/lib/schemas";

interface RouteLineProps {
  route: Route;
  completed: Record<string, Completion>;
  currentTopicId: string | null;
  routeDrawn: boolean;
  onDrawn: () => void;
}

const WAYPOINT_R = 7;
const LINE_X = 16;
const ROW_HEIGHT = 52;
const WEEK_HEADING_HEIGHT = 48;
const PADDING_TOP = 12;

function computeLayout(route: Route) {
  type Item =
    | { type: "week"; week: number; theme: string; y: number }
    | { type: "topic"; id: string; title: string; y: number };

  const items: Item[] = [];
  let y = PADDING_TOP;

  for (const week of route.weeks) {
    items.push({ type: "week", week: week.week, theme: week.theme, y });
    y += WEEK_HEADING_HEIGHT;
    for (const topic of week.topics) {
      items.push({ type: "topic", id: topic.id, title: topic.title, y: y + WAYPOINT_R });
      y += ROW_HEIGHT;
    }
  }

  return { items, totalHeight: y + PADDING_TOP };
}

export function RouteLine({ route, completed, currentTopicId, routeDrawn, onDrawn }: RouteLineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const animatedRef = useRef(false);

  const { items, totalHeight } = computeLayout(route);
  const topicItems = items.filter((i) => i.type === "topic") as { type: "topic"; id: string; title: string; y: number }[];

  // Build path data: a single vertical line connecting all waypoints
  const firstTopic = topicItems[0];
  const lastTopic = topicItems[topicItems.length - 1];
  const linePathD = firstTopic && lastTopic
    ? `M ${LINE_X} ${firstTopic.y} L ${LINE_X} ${lastTopic.y}`
    : "";
  const pathLength = lastTopic && firstTopic ? lastTopic.y - firstTopic.y : 0;

  // Animate on first render if not already drawn
  useEffect(() => {
    if (routeDrawn || animatedRef.current || !lineRef.current || pathLength === 0) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      onDrawn();
      return;
    }

    animatedRef.current = true;
    const el = lineRef.current;
    el.style.strokeDasharray = String(pathLength);
    el.style.strokeDashoffset = String(pathLength);

    // Force reflow
    void el.getBoundingClientRect();

    el.style.transition = `stroke-dashoffset 1200ms cubic-bezier(0.2, 0, 0, 1)`;
    el.style.strokeDashoffset = "0";

    const timer = setTimeout(() => {
      onDrawn();
    }, 1250);

    return () => clearTimeout(timer);
  }, [routeDrawn, pathLength, onDrawn]);

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        width="100%"
        height={totalHeight}
        viewBox={`0 0 320 ${totalHeight}`}
        preserveAspectRatio="xMinYMin meet"
        aria-label="Learning route"
        role="img"
        className="overflow-visible"
      >
        {/* Background line (dashed) */}
        {linePathD && (
          <path
            d={linePathD}
            stroke="var(--line)"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
        )}

        {/* Completed solid line overlay */}
        {(() => {
          const completedTopics = topicItems.filter((t) => completed[t.id]);
          if (completedTopics.length < 2) return null;
          const first = completedTopics[0];
          const last = completedTopics[completedTopics.length - 1];
          return (
            <path
              d={`M ${LINE_X} ${first.y} L ${LINE_X} ${last.y}`}
              stroke="var(--ink)"
              strokeWidth="2"
              fill="none"
              ref={lineRef}
            />
          );
        })()}

        {/* Items */}
        {items.map((item) => {
          if (item.type === "week") {
            return (
              <text
                key={`week-${item.week}`}
                x={LINE_X + 20}
                y={item.y + 18}
                className="text-heading"
                style={{
                  fontSize: "var(--text-heading-size)",
                  fontFamily: "var(--font-schibsted), system-ui, sans-serif",
                  fontWeight: 600,
                  fill: "var(--ink)",
                }}
              >
                Week {item.week}: {item.theme}
              </text>
            );
          }

          const isDone = !!completed[item.id];
          const isCurrent = item.id === currentTopicId;

          return (
            <g key={item.id}>
              {/* Waypoint circle */}
              {isDone ? (
                <>
                  <circle
                    cx={LINE_X}
                    cy={item.y}
                    r={WAYPOINT_R}
                    fill="var(--cobalt)"
                    stroke="none"
                  />
                  <path
                    d={`M ${LINE_X - 3.5} ${item.y} L ${LINE_X - 1} ${item.y + 3} L ${LINE_X + 3.5} ${item.y - 3}`}
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </>
              ) : isCurrent ? (
                <>
                  <circle
                    cx={LINE_X}
                    cy={item.y}
                    r={WAYPOINT_R}
                    fill="var(--marigold)"
                    stroke="var(--ink)"
                    strokeWidth="2"
                  />
                </>
              ) : (
                <circle
                  cx={LINE_X}
                  cy={item.y}
                  r={WAYPOINT_R}
                  fill="var(--surface)"
                  stroke="var(--line)"
                  strokeWidth="2"
                />
              )}

              {/* Topic label */}
              <foreignObject
                x={LINE_X + 20}
                y={item.y - 12}
                width={260}
                height={30}
              >
                <Link
                  href={`/lesson/${item.id}`}
                  className={`
                    block text-ui leading-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)] rounded-sm
                    ${isDone ? "text-[var(--ink-soft)]" : isCurrent ? "text-[var(--ink)] font-semibold" : "text-[var(--ink)]"}
                    hover:text-[var(--cobalt)]
                  `}
                  style={{ transition: "color var(--duration-fast) var(--ease-out)", whiteSpace: "normal", wordBreak: "break-word" }}
                >
                  {item.title}
                </Link>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
