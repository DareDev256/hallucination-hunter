"use client";

import { useState, useCallback, useMemo } from "react";
import { passages } from "@/data/passages";
import type { HallucinationPassage } from "@/types/hallucination";

/**
 * Diversity-aware passage selection hook.
 *
 * Instead of cycling sequentially, this hook:
 * 1. Tracks which passages have been seen this session
 * 2. Alternates categories so players don't see the same type back-to-back
 * 3. Shuffles within each category for variety
 * 4. Resets the pool when all passages have been played
 */

/** Fisher-Yates shuffle (non-deterministic) */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * De-clump consecutive same-category passages.
 * Scans the queue and swaps offenders with the nearest different-category
 * neighbour that won't itself create a new clump.
 */
function declump(queue: HallucinationPassage[]): HallucinationPassage[] {
  const q = [...queue];
  for (let i = 1; i < q.length; i++) {
    if (q[i].category !== q[i - 1].category) continue;
    // Find the closest swap candidate further ahead
    for (let j = i + 1; j < q.length; j++) {
      const safe =
        q[j].category !== q[i - 1].category &&
        (j + 1 >= q.length || q[j + 1]?.category !== q[i].category);
      if (safe) {
        [q[i], q[j]] = [q[j], q[i]];
        break;
      }
    }
  }
  return q;
}

/** Build a category-interleaved queue from the full passage list */
function buildDiverseQueue(exclude?: string): HallucinationPassage[] {
  if (passages.length === 0) return [];

  const byCategory = new Map<string, HallucinationPassage[]>();
  for (const p of passages) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }

  // Shuffle within each category
  const shuffled = new Map<string, HallucinationPassage[]>();
  for (const [cat, list] of byCategory) {
    shuffled.set(cat, shuffle(list));
  }

  // Sort categories by descending size so the largest leads the round-robin,
  // minimising tail clumping when categories are unevenly sized.
  const categories = [...shuffled.keys()].sort(
    (a, b) => (shuffled.get(b)!.length - shuffled.get(a)!.length)
  );

  // If we know the last-played category, ensure it doesn't lead
  if (exclude) {
    const idx = categories.indexOf(exclude);
    if (idx === 0 && categories.length > 1) {
      // Swap with the second-largest instead of pushing to end,
      // so the interleaving order stays as balanced as possible
      [categories[0], categories[1]] = [categories[1], categories[0]];
    }
  }

  const queue: HallucinationPassage[] = [];
  const iterators = new Map<string, number>();
  for (const cat of categories) iterators.set(cat, 0);

  let remaining = passages.length;
  let catIdx = 0;

  while (remaining > 0) {
    const cat = categories[catIdx % categories.length];
    const catList = shuffled.get(cat)!;
    const pos = iterators.get(cat)!;

    if (pos < catList.length) {
      queue.push(catList[pos]);
      iterators.set(cat, pos + 1);
      remaining--;
    }

    catIdx++;
  }

  // Final pass: break any remaining consecutive same-category runs
  return declump(queue);
}

export interface PassageSelection {
  /** The current passage to display */
  current: HallucinationPassage;
  /** How many passages played this session */
  played: number;
  /** Total available passages */
  total: number;
  /** Advance to next diversity-picked passage */
  advance: () => void;
}

export function usePassageSelection(): PassageSelection {
  const [queue, setQueue] = useState<HallucinationPassage[]>(() =>
    buildDiverseQueue()
  );
  const [cursor, setCursor] = useState(0);
  const [played, setPlayed] = useState(0);

  const current = useMemo(() => queue[cursor], [queue, cursor]);

  const advance = useCallback(() => {
    setPlayed((p) => p + 1);

    if (cursor + 1 < queue.length) {
      // More in the current queue
      setCursor((c) => c + 1);
    } else {
      // All passages seen — rebuild a fresh diverse queue,
      // avoiding the same starting category as the last passage
      const lastCategory = queue[cursor].category;
      const fresh = buildDiverseQueue(lastCategory);
      setQueue(fresh);
      setCursor(0);
    }
  }, [cursor, queue]);

  return { current, played, total: passages.length, advance };
}
