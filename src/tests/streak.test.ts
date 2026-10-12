import { describe, it, expect } from "vitest";
import { currentStreak, weekStrip } from "../lib/streak";

describe("currentStreak", () => {
  it("returns 0 for an empty list", () => {
    expect(currentStreak([], "2024-01-15")).toBe(0);
  });

  it("returns 1 when only today is active", () => {
    expect(currentStreak(["2024-01-15"], "2024-01-15")).toBe(1);
  });

  it("returns streak when yesterday and days before are active but not today", () => {
    // yesterday active → streak still counts (at risk)
    expect(currentStreak(["2024-01-14", "2024-01-13"], "2024-01-15")).toBe(2);
  });

  it("returns 0 when there is a gap of two days", () => {
    // last active was 2 days ago, not yesterday
    expect(currentStreak(["2024-01-13"], "2024-01-15")).toBe(0);
  });

  it("returns 0 when neither today nor yesterday is active", () => {
    expect(currentStreak(["2024-01-10", "2024-01-11"], "2024-01-15")).toBe(0);
  });

  it("handles a week boundary correctly", () => {
    // Mon Jan 8 through Sun Jan 14 are all active, today is Mon Jan 15
    const days = ["2024-01-08", "2024-01-09", "2024-01-10", "2024-01-11", "2024-01-12", "2024-01-13", "2024-01-14"];
    // yesterday (Jan 14) is active → streak = 7
    expect(currentStreak(days, "2024-01-15")).toBe(7);
  });

  it("returns streak including today when today is active", () => {
    const days = ["2024-01-13", "2024-01-14", "2024-01-15"];
    expect(currentStreak(days, "2024-01-15")).toBe(3);
  });
});

describe("weekStrip", () => {
  it("returns 7 cells", () => {
    const strip = weekStrip([], "2024-01-15"); // Monday Jan 15
    expect(strip).toHaveLength(7);
  });

  it("marks today correctly", () => {
    const strip = weekStrip([], "2024-01-15");
    const today = strip.find((d) => d.isToday);
    expect(today?.date).toBe("2024-01-15");
  });

  it("marks active days correctly", () => {
    const strip = weekStrip(["2024-01-15", "2024-01-16"], "2024-01-15");
    expect(strip[0].active).toBe(true); // Monday
    expect(strip[1].active).toBe(true); // Tuesday
    expect(strip[2].active).toBe(false); // Wednesday
  });

  it("starts the strip on Monday", () => {
    // Jan 17 2024 is a Wednesday
    const strip = weekStrip([], "2024-01-17");
    expect(strip[0].date).toBe("2024-01-15"); // Monday
    expect(strip[6].date).toBe("2024-01-21"); // Sunday
  });
});
