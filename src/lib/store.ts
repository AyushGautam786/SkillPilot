"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useSyncExternalStore } from "react";
import type { Profile, Route, Lesson, Completion, Usage } from "./schemas";
import { localDateString } from "./dates";

const LESSON_CACHE_MAX = 30;
const DAILY_LESSON_CAP = 15;

interface StoreState {
  profile: Profile | null;
  route: Route | null;
  routeDrawn: boolean;
  lessons: Record<string, Lesson>;
  completed: Record<string, Completion>;
  labDone: Record<string, boolean>;
  activeDays: string[];
  usage: Usage;
}

interface StoreActions {
  setProfileAndRoute: (profile: Profile, route: Route) => void;
  cacheLesson: (lesson: Lesson) => void;
  markLabDone: (topicId: string) => void;
  finishQuiz: (topicId: string, score: number) => void;
  recordActiveDay: () => void;
  canGenerateLesson: () => boolean;
  incrementLessonUsage: () => void;
  resetAll: () => void;
}

type Store = StoreState & StoreActions;

const initialState: StoreState = {
  profile: null,
  route: null,
  routeDrawn: false,
  lessons: {},
  completed: {},
  labDone: {},
  activeDays: [],
  usage: { date: "", lessonCalls: 0 },
};

function addActiveDay(activeDays: string[]): string[] {
  const today = localDateString();
  if (activeDays.includes(today)) return activeDays;
  return [...activeDays, today].sort();
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfileAndRoute(profile, route) {
        set({ profile, route, routeDrawn: false });
      },

      cacheLesson(lesson) {
        set((state) => {
          const lessons = { ...state.lessons, [lesson.topicId]: lesson };
          const keys = Object.keys(lessons);
          // Evict oldest completed lesson when over cap
          if (keys.length > LESSON_CACHE_MAX) {
            const completedIds = new Set(Object.keys(state.completed));
            const oldest = keys.find((k) => completedIds.has(k));
            if (oldest) delete lessons[oldest];
          }
          return { lessons };
        });
      },

      markLabDone(topicId) {
        set((state) => ({
          labDone: { ...state.labDone, [topicId]: true },
          activeDays: addActiveDay(state.activeDays),
        }));
      },

      finishQuiz(topicId, score) {
        set((state) => {
          const existing = state.completed[topicId];
          // Only overwrite if new score is higher
          if (existing && existing.score >= score) {
            return { activeDays: addActiveDay(state.activeDays) };
          }
          return {
            completed: {
              ...state.completed,
              [topicId]: { score, total: 5, finishedOn: localDateString() },
            },
            activeDays: addActiveDay(state.activeDays),
          };
        });
      },

      recordActiveDay() {
        set((state) => ({ activeDays: addActiveDay(state.activeDays) }));
      },

      canGenerateLesson() {
        const { usage } = get();
        const today = localDateString();
        if (usage.date !== today) return true;
        return usage.lessonCalls < DAILY_LESSON_CAP;
      },

      incrementLessonUsage() {
        set((state) => {
          const today = localDateString();
          if (state.usage.date !== today) {
            return { usage: { date: today, lessonCalls: 1 } };
          }
          return { usage: { date: today, lessonCalls: state.usage.lessonCalls + 1 } };
        });
      },

      resetAll() {
        set(initialState);
      },
    }),
    {
      name: "skillpilot:v1",
      // Avoid SSR/localStorage access during server render
      skipHydration: true,
    }
  )
);

// Selectors
export function selectCurrentTopic(state: StoreState) {
  if (!state.route) return null;
  for (const week of state.route.weeks) {
    for (const topic of week.topics) {
      if (!state.completed[topic.id]) return topic;
    }
  }
  return null; // All complete
}

export function selectCompletedCount(state: StoreState): number {
  return Object.keys(state.completed).length;
}

export function selectTotalTopicCount(state: StoreState): number {
  if (!state.route) return 0;
  return state.route.weeks.reduce((acc, w) => acc + w.topics.length, 0);
}

export function selectAverageScore(state: StoreState): number {
  const completions = Object.values(state.completed);
  if (completions.length === 0) return 0;
  const total = completions.reduce((acc, c) => acc + c.score, 0);
  return Math.round((total / (completions.length * 5)) * 100);
}

export function selectCurrentWeek(state: StoreState): { week: number; theme: string } | null {
  if (!state.route) return null;
  const currentTopic = selectCurrentTopic(state);
  if (!currentTopic) return null;
  // Find which week contains the current topic
  for (const week of state.route.weeks) {
    if (week.topics.some((t) => t.id === currentTopic.id)) {
      return { week: week.week, theme: week.theme };
    }
  }
  return null;
}

// Hook that ensures store is only read after hydration
export function useHydrated() {
  useEffect(() => {
    useStore.persist.rehydrate();
  }, []);

  return useSyncExternalStore(
    (callback) => useStore.persist.onFinishHydration(callback),
    () => useStore.persist.hasHydrated(),
    () => false
  );
}

// Re-sync store from localStorage when tab regains focus
if (typeof window !== "undefined") {
  window.addEventListener("focus", () => {
    useStore.persist.rehydrate();
  });
}
