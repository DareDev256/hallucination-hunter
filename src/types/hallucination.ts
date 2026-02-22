// ─── Hallucination Hunter — Game-Specific Types ───

import { Enrichment } from "./game";

export interface ClaimAnnotation {
  isHallucination: boolean;
  explanation: string;
}

export interface ParsedClaim {
  id: string;
  text: string;
}

export interface HallucinationPassage {
  id: string;
  /** Raw prompt with [text]{claim-id} markup */
  prompt: string;
  category: "obvious-fabrications" | "plausible-but-wrong";
  difficulty: "easy" | "medium" | "hard";
  claimAnnotations: Record<string, ClaimAnnotation>;
  enrichment: Enrichment;
}

export interface ClaimVerdict {
  claimId: string;
  playerFlagged: boolean;
  isHallucination: boolean;
  type: "tp" | "tn" | "fp" | "fn";
  points: number;
}

export interface CaseResults {
  verdicts: ClaimVerdict[];
  totalScore: number;
  accuracy: number;
  tp: number;
  tn: number;
  fp: number;
  fn: number;
}

/** Parse [text]{claim-id} markup into segments */
export function parsePassage(prompt: string): (string | ParsedClaim)[] {
  const segments: (string | ParsedClaim)[] = [];
  const regex = /\[([^\]]+)\]\{([^}]+)\}/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(prompt)) !== null) {
    if (match.index > lastIndex) {
      segments.push(prompt.slice(lastIndex, match.index));
    }
    segments.push({ id: match[2], text: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < prompt.length) {
    segments.push(prompt.slice(lastIndex));
  }
  return segments;
}

/** Score a set of claims against player flags */
export function scoreClaims(
  annotations: Record<string, ClaimAnnotation>,
  flagged: Set<string>
): CaseResults {
  const POINTS = { tp: 15, tn: 5, fp: -10, fn: -5 };
  const verdicts: ClaimVerdict[] = [];
  let tp = 0, tn = 0, fp = 0, fn = 0;

  for (const [claimId, ann] of Object.entries(annotations)) {
    const playerFlagged = flagged.has(claimId);
    let type: ClaimVerdict["type"];
    if (ann.isHallucination && playerFlagged) { type = "tp"; tp++; }
    else if (!ann.isHallucination && !playerFlagged) { type = "tn"; tn++; }
    else if (!ann.isHallucination && playerFlagged) { type = "fp"; fp++; }
    else { type = "fn"; fn++; }
    verdicts.push({ claimId, playerFlagged, isHallucination: ann.isHallucination, type, points: POINTS[type] });
  }

  const total = verdicts.length;
  const correct = tp + tn;
  return {
    verdicts,
    totalScore: verdicts.reduce((s, v) => s + v.points, 0),
    accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    tp, tn, fp, fn,
  };
}
