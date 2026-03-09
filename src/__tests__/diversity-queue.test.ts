import { describe, it, expect } from "vitest";
import { shuffle, declump, buildDiverseQueue } from "@/hooks/usePassageSelection";
import { parsePassage, scoreClaims } from "@/types/hallucination";
import type { HallucinationPassage } from "@/types/hallucination";

// ─── Test fixture factory ───
const enrichment = { whyItMatters: "", realWorldExample: "" };

function passage(id: string, category: string): HallucinationPassage {
  return {
    id,
    prompt: `[claim text]{c1}`,
    category: category as HallucinationPassage["category"],
    difficulty: "easy",
    claimAnnotations: { c1: { isHallucination: false, explanation: "" } },
    enrichment,
  };
}

// ─── shuffle ───
describe("shuffle", () => {
  it("returns same length and same elements", () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect(result.sort()).toEqual(input.sort());
  });

  it("does not mutate the original array", () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it("handles empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("handles single element", () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

// ─── declump ───
describe("declump", () => {
  it("breaks consecutive same-category passages", () => {
    const q = [passage("a", "X"), passage("b", "X"), passage("c", "Y"), passage("d", "Y")];
    const result = declump(q);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].category).not.toBe(result[i - 1].category);
    }
  });

  it("preserves all passages (no drops)", () => {
    const q = [passage("a", "X"), passage("b", "X"), passage("c", "Y")];
    const result = declump(q);
    expect(result.map((p) => p.id).sort()).toEqual(["a", "b", "c"]);
  });

  it("returns unchanged queue when already diverse", () => {
    const q = [passage("a", "X"), passage("b", "Y"), passage("c", "X")];
    const result = declump(q);
    expect(result.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("handles single-category pool gracefully (cannot declump)", () => {
    const q = [passage("a", "X"), passage("b", "X"), passage("c", "X")];
    const result = declump(q);
    expect(result).toHaveLength(3);
  });

  it("handles empty array", () => {
    expect(declump([])).toEqual([]);
  });
});

// ─── buildDiverseQueue ───
describe("buildDiverseQueue", () => {
  it("returns empty array for empty pool", () => {
    expect(buildDiverseQueue(undefined, [])).toEqual([]);
  });

  it("includes every passage exactly once", () => {
    const pool = [passage("1", "A"), passage("2", "A"), passage("3", "B"), passage("4", "B")];
    const result = buildDiverseQueue(undefined, pool);
    expect(result.map((p) => p.id).sort()).toEqual(["1", "2", "3", "4"]);
  });

  it("interleaves categories — no consecutive same-category", () => {
    const pool = [
      passage("a1", "A"), passage("a2", "A"), passage("a3", "A"),
      passage("b1", "B"), passage("b2", "B"), passage("b3", "B"),
    ];
    // Run 20 times to account for shuffle randomness
    for (let run = 0; run < 20; run++) {
      const result = buildDiverseQueue(undefined, pool);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].category).not.toBe(result[i - 1].category);
      }
    }
  });

  it("exclude parameter prevents leading with that category", () => {
    const pool = [
      passage("a1", "A"), passage("a2", "A"), passage("a3", "A"), passage("a4", "A"),
      passage("b1", "B"), passage("b2", "B"),
    ];
    // A is larger so it would normally lead — exclude should prevent that
    for (let run = 0; run < 10; run++) {
      const result = buildDiverseQueue("A", pool);
      expect(result[0].category).toBe("B");
    }
  });

  it("handles uneven category sizes without dropping passages", () => {
    const pool = [
      passage("a1", "A"), passage("a2", "A"), passage("a3", "A"),
      passage("b1", "B"),
    ];
    const result = buildDiverseQueue(undefined, pool);
    expect(result).toHaveLength(4);
    expect(result.map((p) => p.id).sort()).toEqual(["a1", "a2", "a3", "b1"]);
  });

  it("handles single passage", () => {
    const pool = [passage("only", "Z")];
    const result = buildDiverseQueue(undefined, pool);
    expect(result).toEqual(pool);
  });
});

// ─── parsePassage ───
describe("parsePassage", () => {
  it("parses mixed text and claims", () => {
    const result = parsePassage("The bridge, [built in 1937]{c1}, is [orange]{c2}.");
    expect(result).toEqual([
      "The bridge, ",
      { id: "c1", text: "built in 1937" },
      ", is ",
      { id: "c2", text: "orange" },
      ".",
    ]);
  });

  it("returns plain string for no-markup text", () => {
    expect(parsePassage("Just plain text")).toEqual(["Just plain text"]);
  });

  it("handles consecutive claims with no gap", () => {
    const result = parsePassage("[first]{a}[second]{b}");
    expect(result).toEqual([
      { id: "a", text: "first" },
      { id: "b", text: "second" },
    ]);
  });

  it("handles empty string", () => {
    expect(parsePassage("")).toEqual([]);
  });
});

// ─── scoreClaims ───
describe("scoreClaims", () => {
  it("scores perfect detection (all hallucinations caught, no false flags)", () => {
    const annotations = {
      a: { isHallucination: true, explanation: "" },
      b: { isHallucination: false, explanation: "" },
    };
    const flagged = new Set(["a"]);
    const result = scoreClaims(annotations, flagged);
    expect(result.tp).toBe(1);
    expect(result.tn).toBe(1);
    expect(result.fp).toBe(0);
    expect(result.fn).toBe(0);
    expect(result.accuracy).toBe(100);
    expect(result.totalScore).toBe(20); // 15 + 5
  });

  it("punishes trigger-happy flagging (all flagged)", () => {
    const annotations = {
      a: { isHallucination: true, explanation: "" },
      b: { isHallucination: false, explanation: "" },
      c: { isHallucination: false, explanation: "" },
    };
    const flagged = new Set(["a", "b", "c"]);
    const result = scoreClaims(annotations, flagged);
    expect(result.tp).toBe(1);
    expect(result.fp).toBe(2);
    expect(result.totalScore).toBe(15 + -10 + -10); // -5
  });

  it("punishes missing hallucinations", () => {
    const annotations = {
      a: { isHallucination: true, explanation: "" },
      b: { isHallucination: true, explanation: "" },
    };
    const flagged = new Set<string>();
    const result = scoreClaims(annotations, flagged);
    expect(result.fn).toBe(2);
    expect(result.totalScore).toBe(-10); // -5 * 2
  });

  it("handles empty annotations", () => {
    const result = scoreClaims({}, new Set());
    expect(result.accuracy).toBe(0);
    expect(result.totalScore).toBe(0);
    expect(result.verdicts).toEqual([]);
  });
});
