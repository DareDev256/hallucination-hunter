import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  addXP, completeLevel, updateItemScore,
  saveFSRSCard, recordLearningEvent,
  getProgress, getFSRSCards,
  type LearningEvent,
} from "@/lib/storage";

// Mock localStorage for Node environment
const store: Record<string, string> = {};
beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
  });
});

// ─── addXP ───
describe("addXP input validation", () => {
  it("rejects NaN amount — XP stays at 0", () => {
    addXP(NaN);
    expect(getProgress().xp).toBe(0);
  });

  it("rejects Infinity amount", () => {
    addXP(Infinity);
    expect(getProgress().xp).toBe(0);
  });

  it("clamps negative multiplier to 0", () => {
    addXP(100, -5);
    expect(getProgress().xp).toBe(0);
  });

  it("clamps excessive multiplier to 10", () => {
    addXP(100, 999);
    expect(getProgress().xp).toBe(1000); // 100 * 10
  });

  it("accepts valid inputs normally", () => {
    addXP(50, 2);
    expect(getProgress().xp).toBe(100);
  });
});

// ─── completeLevel ───
describe("completeLevel input validation", () => {
  it("rejects empty categoryId", () => {
    completeLevel("", 1);
    expect(getProgress().completedLevels).toEqual([]);
  });

  it("rejects control characters in categoryId", () => {
    completeLevel("cat\x00egory", 1);
    expect(getProgress().completedLevels).toEqual(["category-1"]);
  });

  it("rejects NaN levelId", () => {
    completeLevel("science", NaN);
    expect(getProgress().completedLevels).toEqual([]);
  });

  it("accepts valid inputs", () => {
    completeLevel("science", 3);
    expect(getProgress().completedLevels).toEqual(["science-3"]);
  });
});

// ─── updateItemScore ───
describe("updateItemScore input validation", () => {
  it("rejects empty itemId", () => {
    updateItemScore("", true);
    expect(Object.keys(getProgress().itemScores)).toHaveLength(0);
  });

  it("strips control chars from itemId", () => {
    updateItemScore("item\x1fone", true);
    expect(getProgress().itemScores["itemone"]).toBeDefined();
  });
});

// ─── saveFSRSCard ───
describe("saveFSRSCard input validation", () => {
  it("rejects card with empty itemId", () => {
    saveFSRSCard({ itemId: "", due: 0, stability: 1, difficulty: 1, reps: 0, lapses: 0, lastReview: 0 });
    expect(getFSRSCards()).toHaveLength(0);
  });

  it("clamps numeric fields on valid card", () => {
    saveFSRSCard({ itemId: "test", due: -999, stability: NaN, difficulty: Infinity, reps: 5, lapses: 2, lastReview: 0 });
    const cards = getFSRSCards();
    expect(cards).toHaveLength(1);
    expect(cards[0].due).toBe(0);        // clamped from -999
    expect(cards[0].stability).toBe(0);   // NaN → fallback
    expect(cards[0].difficulty).toBe(0);  // Infinity → fallback
  });
});

// ─── recordLearningEvent ───
describe("recordLearningEvent input validation", () => {
  it("rejects event with invalid type", () => {
    recordLearningEvent({ type: "hacked" as LearningEvent["type"], itemId: "x", timestamp: Date.now() });
    // No crash, no storage write
  });

  it("rejects event with empty itemId", () => {
    recordLearningEvent({ type: "first_correct", itemId: "", timestamp: Date.now() });
    // Should not write
  });

  it("sanitizes event fields on valid input", () => {
    recordLearningEvent({ type: "first_correct", itemId: "item\x00safe", timestamp: Date.now(), accuracy: 200 });
    const stored = JSON.parse(store["hallucination_hunter_analytics"] || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].itemId).toBe("itemsafe"); // control char stripped
    expect(stored[0].accuracy).toBe(100);       // clamped to max 100
  });
});
