"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { UserProgress, Category } from "@/types/game";
import {
  getProgress,
  addXP,
  completeLevel,
  updateStreak,
  checkMastery,
} from "@/lib/storage";

// ─── State ───

interface ProgressState {
  progress: UserProgress | null;
  isLoading: boolean;
}

type ProgressAction =
  | { type: "LOADED"; progress: UserProgress }
  | { type: "SYNC" };

function reducer(_state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case "LOADED":
      return { progress: action.progress, isLoading: false };
    case "SYNC":
      // Always re-read from localStorage — single source of truth
      return { progress: getProgress(), isLoading: false };
  }
}

// ─── Context ───

interface ProgressContextValue {
  progress: UserProgress | null;
  isLoading: boolean;
  earnXP: (amount: number) => UserProgress;
  finishLevel: (categoryId: string, levelId: number) => UserProgress;
  refreshStreak: () => UserProgress;
  isLevelUnlocked: (categoryId: string, levelId: number) => boolean;
  isCategoryUnlocked: (categoryId: string, categories?: Category[]) => boolean;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

// ─── Provider ───

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    progress: null,
    isLoading: true,
  });

  // Mutate helper: perform storage write, then re-read to sync React state
  const mutate = useCallback(
    <T,>(fn: () => T): T => {
      const result = fn();
      dispatch({ type: "SYNC" });
      return result;
    },
    []
  );

  // Initial load (SSR-safe — deferred to next frame)
  useEffect(() => {
    const ac = new AbortController();
    requestAnimationFrame(() => {
      if (ac.signal.aborted) return;
      dispatch({ type: "LOADED", progress: getProgress() });
    });
    return () => ac.abort();
  }, []);

  // Cross-tab sync: another tab wrote to localStorage
  useEffect(() => {
    const ac = new AbortController();
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith("hallucination_hunter")) {
        dispatch({ type: "SYNC" });
      }
    };
    window.addEventListener("storage", onStorage, { signal: ac.signal });
    return () => ac.abort();
  }, []);

  // ─── Actions ───

  const earnXPAction = useCallback(
    (amount: number) => mutate(() => addXP(amount)),
    [mutate]
  );

  const finishLevelAction = useCallback(
    (categoryId: string, levelId: number) =>
      mutate(() => completeLevel(categoryId, levelId)),
    [mutate]
  );

  const refreshStreakAction = useCallback(
    () => mutate(() => updateStreak()),
    [mutate]
  );

  const isLevelUnlocked = useCallback(
    (categoryId: string, levelId: number) => {
      if (!state.progress) return false;
      if (levelId === 1) return true;
      const prevKey = `${categoryId}-${levelId - 1}`;
      return (
        state.progress.completedLevels.includes(prevKey) &&
        checkMastery(prevKey)
      );
    },
    [state.progress]
  );

  const isCategoryUnlocked = useCallback(
    (categoryId: string, cats?: Category[]) => {
      if (!state.progress || !cats) return true;
      const idx = cats.findIndex((c) => c.id === categoryId);
      if (idx <= 0) return true;
      const prev = cats[idx - 1];
      return prev.levels.every((level) =>
        state.progress!.completedLevels.includes(`${prev.id}-${level.id}`)
      );
    },
    [state.progress]
  );

  return (
    <ProgressContext.Provider
      value={{
        progress: state.progress,
        isLoading: state.isLoading,
        earnXP: earnXPAction,
        finishLevel: finishLevelAction,
        refreshStreak: refreshStreakAction,
        isLevelUnlocked,
        isCategoryUnlocked,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

// ─── Hook ───

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within <ProgressProvider>");
  }
  return ctx;
}
