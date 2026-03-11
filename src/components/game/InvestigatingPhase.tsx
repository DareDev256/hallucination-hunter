"use client";

import { motion } from "framer-motion";
import type { ParsedClaim } from "@/types/hallucination";
import { Button } from "@/components/ui/Button";

const phaseMotion = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

interface InvestigatingPhaseProps {
  segments: (string | ParsedClaim)[];
  flagged: Set<string>;
  claimCount: number;
  onToggleClaim: (id: string) => void;
  onSubmit: () => void;
}

export function InvestigatingPhase({
  segments,
  flagged,
  claimCount,
  onToggleClaim,
  onSubmit,
}: InvestigatingPhaseProps) {
  return (
    <motion.div key="investigating" className="case-file w-full max-w-2xl" {...phaseMotion}>
      <div className="font-mono text-[10px] text-game-primary/50 tracking-[0.3em] mb-4 uppercase">
        Document Under Review
      </div>

      <div
        className="font-mono text-sm md:text-base text-game-accent/90 leading-relaxed mb-8"
        role="group"
        aria-label="Passage with clickable claims"
      >
        {segments.map((seg, i) => {
          if (typeof seg === "string") {
            return <span key={i}>{seg}</span>;
          }
          const claim = seg as ParsedClaim;
          const isFlagged = flagged.has(claim.id);
          return (
            <button
              key={claim.id}
              onClick={() => onToggleClaim(claim.id)}
              className={`claim-span ${isFlagged ? "claim-span--flagged" : "claim-span--neutral"}`}
              aria-pressed={isFlagged}
              aria-label={`Claim: ${claim.text}. ${isFlagged ? "Flagged as hallucination" : "Not flagged"}`}
            >
              {claim.text}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-game-secondary/30 pt-4">
        <span className="font-mono text-[10px] text-game-accent/40">
          {flagged.size}/{claimCount} claims flagged
        </span>
        <Button onClick={onSubmit} variant="primary">
          SUBMIT VERDICT
        </Button>
      </div>
    </motion.div>
  );
}
