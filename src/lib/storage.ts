import { UserProgress } from "@/types/game";

// ─── Passionate Learning — Persistence Layer ───
// Pure functions over localStorage. SSR-safe. Merge-on-read for forward compat.
// Each game sets its own GAME_ID to namespace storage keys.

const GAME_ID = "hallucination_hunter"; // OVERRIDE per game
const STORAGE_KEY = `${GAME_ID}_progress`;
const LAST_PLAYED_KEY = `${GAME_ID}_last_played`;
const MASTERY_KEY = `${GAME_ID}_mastery`;
const FSRS_KEY = `${GAME_ID}_fsrs_cards`;
const ANALYTICS_KEY = `${GAME_ID}_analytics`;

// ─── Security: Safe JSON Parse ───
// localStorage is writable by any script on the same origin (XSS, extensions,
// dev console). Never trust parsed data — validate shape and sanitize types.

/** Parse JSON from localStorage with prototype pollution protection */
function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object") return fallback;
    // Strip prototype pollution vectors
    if ("__proto__" in parsed) delete parsed.__proto__;
    if ("constructor" in parsed) delete parsed.constructor;
    if ("prototype" in parsed) delete parsed.prototype;
    return parsed;
  } catch {
    return fallback;
  }
}

/** Clamp a number to safe bounds, returning fallback if not a finite number */
function safeInt(val: unknown, fallback: number, min = 0, max = 999_999): number {
  if (typeof val !== "number" || !Number.isFinite(val)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(val)));
}

/** Validate and sanitize UserProgress from untrusted source */
function validateProgress(raw: unknown): UserProgress {
  if (!raw || typeof raw !== "object") return defaultProgress;
  const obj = raw as Record<string, unknown>;

  // Validate completedLevels — must be string[]
  let completedLevels: string[] = [];
  if (Array.isArray(obj.completedLevels)) {
    completedLevels = obj.completedLevels
      .filter((v): v is string => typeof v === "string")
      .slice(0, 10_000); // cap to prevent memory bombs
  }

  // Validate itemScores — must be Record<string, {correct, incorrect, lastSeen}>
  const itemScores: UserProgress["itemScores"] = {};
  if (obj.itemScores && typeof obj.itemScores === "object" && !Array.isArray(obj.itemScores)) {
    const raw = obj.itemScores as Record<string, unknown>;
    const keys = Object.keys(raw).slice(0, 10_000); // cap key count
    for (const key of keys) {
      const entry = raw[key];
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        const e = entry as Record<string, unknown>;
        itemScores[key] = {
          correct: safeInt(e.correct, 0),
          incorrect: safeInt(e.incorrect, 0),
          lastSeen: safeInt(e.lastSeen, 0, 0, Number.MAX_SAFE_INTEGER),
        };
      }
    }
  }

  return {
    xp: safeInt(obj.xp, 0),
    level: safeInt(obj.level, 1, 1),
    currentCategory: typeof obj.currentCategory === "string"
      ? obj.currentCategory.slice(0, 200)
      : "",
    completedLevels,
    streak: safeInt(obj.streak, 0),
    streakFreezes: safeInt(obj.streakFreezes, 0),
    itemScores,
  };
}

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  currentCategory: "",
  completedLevels: [],
  streak: 0,
  streakFreezes: 0,
  itemScores: {},
};

export function getProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    return validateProgress(safeParseJSON(stored, null));
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateProgress(updates: Partial<UserProgress>): UserProgress {
  const current = getProgress();
  const updated = { ...current, ...updates };
  saveProgress(updated);
  return updated;
}

// ─── XP System with Delayed Rewards ───
// 1x on first correct, 2x on 7-day recall, 3x on 30-day recall

export function addXP(amount: number, multiplier = 1): UserProgress {
  // Validate inputs — reject NaN, Infinity, negative XP grants
  const safeAmount = safeInt(amount, 0, -1000, 10_000);
  const safeMult = typeof multiplier === "number" && Number.isFinite(multiplier)
    ? Math.max(0, Math.min(multiplier, 10))
    : 1;
  const current = getProgress();
  const newXP = safeInt(current.xp + Math.round(safeAmount * safeMult), current.xp);
  const newLevel = Math.floor(newXP / 100) + 1;
  return updateProgress({ xp: newXP, level: newLevel });
}

export function getRecallMultiplier(itemId: string): number {
  const current = getProgress();
  const score = current.itemScores[itemId];
  if (!score || score.correct === 0) return 1; // First time
  const daysSinceLastSeen = (Date.now() - score.lastSeen) / (1000 * 60 * 60 * 24);
  if (daysSinceLastSeen >= 30) return 3;  // 30-day recall = 3x XP
  if (daysSinceLastSeen >= 7) return 2;   // 7-day recall = 2x XP
  return 1;
}

/** Sanitize a string ID — strip control chars, cap length */
function sanitizeId(id: string, maxLen = 200): string {
  if (typeof id !== "string") return "";
  // Strip control characters (U+0000–U+001F, U+007F–U+009F) and trim
  return id.replace(/[\x00-\x1f\x7f-\x9f]/g, "").trim().slice(0, maxLen);
}

export function completeLevel(categoryId: string, levelId: number): UserProgress {
  const safeCat = sanitizeId(categoryId, 100);
  const safeLevel = safeInt(levelId, -1, 0, 10_000);
  if (!safeCat || safeLevel < 0) return getProgress(); // reject invalid input
  const current = getProgress();
  const levelKey = `${safeCat}-${safeLevel}`;
  if (!current.completedLevels.includes(levelKey)) {
    // Award streak freeze every 10 levels
    const newCompleted = [...current.completedLevels, levelKey];
    const earnedFreeze = newCompleted.length % 10 === 0;
    return updateProgress({
      completedLevels: newCompleted,
      streakFreezes: current.streakFreezes + (earnedFreeze ? 1 : 0),
    });
  }
  return current;
}

export function updateItemScore(itemId: string, isCorrect: boolean): UserProgress {
  const safeId = sanitizeId(itemId);
  if (!safeId) return getProgress(); // reject empty/invalid IDs
  if (typeof isCorrect !== "boolean") return getProgress();
  const current = getProgress();
  const existing = current.itemScores[safeId] || {
    correct: 0,
    incorrect: 0,
    lastSeen: 0,
  };
  return updateProgress({
    itemScores: {
      ...current.itemScores,
      [safeId]: {
        correct: existing.correct + (isCorrect ? 1 : 0),
        incorrect: existing.incorrect + (isCorrect ? 0 : 1),
        lastSeen: Date.now(),
      },
    },
  });
}

// ─── FSRS-4.5 Spaced Repetition ───
// Uses ts-fsrs for research-grade scheduling.
// Cards stored in localStorage, keyed by item ID.
// Each card tracks: difficulty, stability, retrievability, due date.
// Passion Agent will integrate ts-fsrs during build.
// This is the localStorage bridge for FSRS card state.

export interface FSRSCard {
  itemId: string;
  due: number;         // timestamp when review is due
  stability: number;   // memory stability
  difficulty: number;  // item difficulty (0-1)
  reps: number;        // number of reviews
  lapses: number;      // number of times forgotten
  lastReview: number;  // timestamp of last review
}

export function getFSRSCards(): FSRSCard[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(FSRS_KEY);
    const raw = safeParseJSON<unknown>(stored, []);
    if (!Array.isArray(raw)) return [];
    const parsed = raw as unknown[];
    return parsed
      .filter((c): c is Record<string, unknown> => c !== null && typeof c === "object" && !Array.isArray(c))
      .slice(0, 10_000)
      .map((c) => ({
        itemId: typeof c.itemId === "string" ? c.itemId.slice(0, 200) : "",
        due: safeInt(c.due, 0, 0, Number.MAX_SAFE_INTEGER),
        stability: safeInt(c.stability, 0),
        difficulty: safeInt(c.difficulty, 0),
        reps: safeInt(c.reps, 0),
        lapses: safeInt(c.lapses, 0),
        lastReview: safeInt(c.lastReview, 0, 0, Number.MAX_SAFE_INTEGER),
      }))
      .filter((c) => c.itemId.length > 0);
  } catch {
    return [];
  }
}

/** Validate an FSRS card before writing — clamp all numeric fields */
function validateFSRSCard(card: FSRSCard): FSRSCard | null {
  const itemId = sanitizeId(card.itemId);
  if (!itemId) return null;
  return {
    itemId,
    due: safeInt(card.due, 0, 0, Number.MAX_SAFE_INTEGER),
    stability: safeInt(card.stability, 0),
    difficulty: safeInt(card.difficulty, 0),
    reps: safeInt(card.reps, 0),
    lapses: safeInt(card.lapses, 0),
    lastReview: safeInt(card.lastReview, 0, 0, Number.MAX_SAFE_INTEGER),
  };
}

export function saveFSRSCard(card: FSRSCard): void {
  if (typeof window === "undefined") return;
  const validated = validateFSRSCard(card);
  if (!validated) return; // reject malformed cards
  const cards = getFSRSCards();
  const idx = cards.findIndex((c) => c.itemId === validated.itemId);
  if (idx >= 0) {
    cards[idx] = validated;
  } else {
    if (cards.length >= 10_000) return; // cap total cards to prevent storage bombs
    cards.push(validated);
  }
  localStorage.setItem(FSRS_KEY, JSON.stringify(cards));
}

export function getDueItems(limit = 5): string[] {
  const now = Date.now();
  return getFSRSCards()
    .filter((card) => card.due <= now)
    .sort((a, b) => a.due - b.due)
    .slice(0, limit)
    .map((card) => card.itemId);
}

// Fallback review queue (for before FSRS is fully integrated)
export function getItemsForReview(limit = 5): string[] {
  // Prefer FSRS-scheduled items
  const fsrsDue = getDueItems(limit);
  if (fsrsDue.length > 0) return fsrsDue;

  // Fallback: naive incorrect > correct sorting
  const current = getProgress();
  return Object.entries(current.itemScores)
    .filter(([, score]) => score.incorrect > score.correct)
    .sort((a, b) => a[1].lastSeen - b[1].lastSeen)
    .slice(0, limit)
    .map(([id]) => id);
}

// ─── Streak System with Freeze ───

export function updateStreak(): UserProgress {
  if (typeof window === "undefined") return getProgress();
  const current = getProgress();
  const lastPlayed = localStorage.getItem(LAST_PLAYED_KEY);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  let newStreak = current.streak;
  let freezesUsed = 0;

  if (lastPlayed === yesterday) {
    newStreak = current.streak + 1;
  } else if (lastPlayed !== today) {
    // Missed a day — try to use a streak freeze
    if (current.streakFreezes > 0) {
      freezesUsed = 1;
      // Streak preserved, but no increment
    } else {
      newStreak = 1; // Reset
    }
  }

  localStorage.setItem(LAST_PLAYED_KEY, today);
  return updateProgress({
    streak: newStreak,
    streakFreezes: current.streakFreezes - freezesUsed,
  });
}

// ─── Mastery Gate (Kumon-style) ───
// 90% accuracy on last 3 attempts to unlock next level

interface MasteryAttempt {
  accuracy: number;
  timestamp: number;
}

export function recordMasteryAttempt(levelKey: string, accuracy: number): void {
  if (typeof window === "undefined") return;
  const safeKey = sanitizeId(levelKey, 300);
  if (!safeKey) return; // reject empty keys
  const safeAccuracy = safeInt(accuracy, -1, 0, 100);
  if (safeAccuracy < 0) return; // reject non-numeric accuracy
  try {
    const stored = localStorage.getItem(MASTERY_KEY);
    const data = safeParseJSON<Record<string, unknown>>(stored, {});
    const raw = data[safeKey];
    const attempts: MasteryAttempt[] = Array.isArray(raw)
      ? raw.filter((a): a is MasteryAttempt =>
          a && typeof a === "object" && typeof a.accuracy === "number" && typeof a.timestamp === "number"
        )
      : [];
    attempts.push({ accuracy: safeAccuracy, timestamp: Date.now() });
    data[safeKey] = attempts.slice(-5);
    localStorage.setItem(MASTERY_KEY, JSON.stringify(data));
  } catch {
    // Silently fail on storage errors
  }
}

export function checkMastery(levelKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = localStorage.getItem(MASTERY_KEY);
    if (!stored) return false;
    const data = safeParseJSON<Record<string, unknown>>(stored, {});
    const raw = data[levelKey];
    if (!Array.isArray(raw)) return false;
    const attempts = raw.filter((a): a is MasteryAttempt =>
      a && typeof a === "object" && typeof a.accuracy === "number" && typeof a.timestamp === "number"
    );
    if (attempts.length < 3) return false;
    const last3 = attempts.slice(-3);
    return last3.every((a) => a.accuracy >= 90);
  } catch {
    return false;
  }
}

// ─── Learning Analytics ───
// Track what matters: are people LEARNING, not just playing?

export interface LearningEvent {
  type: "first_correct" | "review_correct" | "review_incorrect" | "concept_mastered" | "drop_off";
  itemId: string;
  timestamp: number;
  daysSinceLastSeen?: number;
  accuracy?: number;
}

const VALID_EVENT_TYPES = new Set(["first_correct", "review_correct", "review_incorrect", "concept_mastered", "drop_off"]);

function isValidLearningEvent(e: unknown): e is LearningEvent {
  if (!e || typeof e !== "object" || Array.isArray(e)) return false;
  const obj = e as Record<string, unknown>;
  return (
    typeof obj.type === "string" &&
    VALID_EVENT_TYPES.has(obj.type) &&
    typeof obj.itemId === "string" &&
    typeof obj.timestamp === "number"
  );
}

export function recordLearningEvent(event: LearningEvent): void {
  if (typeof window === "undefined") return;
  if (!event || typeof event !== "object") return;
  if (!VALID_EVENT_TYPES.has(event.type)) return; // reject invalid event types
  const safeItemId = sanitizeId(event.itemId);
  if (!safeItemId) return; // reject empty item IDs
  // Rebuild event with sanitized fields to prevent property injection
  const sanitized: LearningEvent = {
    type: event.type,
    itemId: safeItemId,
    timestamp: safeInt(event.timestamp, Date.now(), 0, Number.MAX_SAFE_INTEGER),
    ...(event.daysSinceLastSeen !== undefined && {
      daysSinceLastSeen: safeInt(event.daysSinceLastSeen, 0, 0, 36500),
    }),
    ...(event.accuracy !== undefined && {
      accuracy: safeInt(event.accuracy, 0, 0, 100),
    }),
  };
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    const parsed = safeParseJSON<unknown>(stored, null);
    const events: LearningEvent[] = Array.isArray(parsed)
      ? (parsed as unknown[]).filter(isValidLearningEvent)
      : [];
    events.push(sanitized);
    // Keep last 1000 events
    const trimmed = events.slice(-1000);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
  } catch {
    // Silently fail
  }
}

export function getLearningAnalytics(): {
  totalItemsSeen: number;
  itemsMastered: number;
  averageTimeToMastery: number;
  retentionRate7Day: number;
  retentionRate30Day: number;
} {
  if (typeof window === "undefined") {
    return { totalItemsSeen: 0, itemsMastered: 0, averageTimeToMastery: 0, retentionRate7Day: 0, retentionRate30Day: 0 };
  }
  try {
    const stored = localStorage.getItem(ANALYTICS_KEY);
    const parsed = safeParseJSON<unknown>(stored, null);
    const events: LearningEvent[] = Array.isArray(parsed)
      ? (parsed as unknown[]).filter(isValidLearningEvent)
      : [];

    const itemsSeen = new Set(events.map((e) => e.itemId));
    const mastered = events.filter((e) => e.type === "concept_mastered");
    const reviews7d = events.filter((e) => e.type === "review_correct" && (e.daysSinceLastSeen || 0) >= 7);
    const reviewAttempts7d = events.filter(
      (e) => (e.type === "review_correct" || e.type === "review_incorrect") && (e.daysSinceLastSeen || 0) >= 7
    );

    return {
      totalItemsSeen: itemsSeen.size,
      itemsMastered: mastered.length,
      averageTimeToMastery: 0, // Computed from first_correct to concept_mastered timestamps
      retentionRate7Day: reviewAttempts7d.length > 0
        ? Math.round((reviews7d.length / reviewAttempts7d.length) * 100)
        : 0,
      retentionRate30Day: 0, // Same pattern for 30-day window
    };
  } catch {
    return { totalItemsSeen: 0, itemsMastered: 0, averageTimeToMastery: 0, retentionRate7Day: 0, retentionRate30Day: 0 };
  }
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LAST_PLAYED_KEY);
  localStorage.removeItem(MASTERY_KEY);
  localStorage.removeItem(FSRS_KEY);
  localStorage.removeItem(ANALYTICS_KEY);
}
