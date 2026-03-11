"use client";

import { motion } from "framer-motion";
import type { CaseResults, ParsedClaim, ClaimAnnotation } from "@/types/hallucination";
import type { Enrichment } from "@/types/game";
import { Button } from "@/components/ui/Button";

const phaseMotion = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const VERDICT_LABELS: Record<string, string> = {
  tp: "✓ CAUGHT",
  tn: "✓ CLEARED",
  fp: "✗ FALSE ACC.",
  fn: "✗ MISSED",
};

interface ResultsPhaseProps {
  results: CaseResults;
  claimMap: Map<string, ParsedClaim>;
  claimAnnotations: Record<string, ClaimAnnotation>;
  enrichment: Enrichment;
  onNextCase: () => void;
}

export function ResultsPhase({
  results,
  claimMap,
  claimAnnotations,
  enrichment,
  onNextCase,
}: ResultsPhaseProps) {
  return (
    <motion.div key="results" className="case-file w-full max-w-2xl" {...phaseMotion}>
      <div className="font-mono text-[10px] text-game-primary/50 tracking-[0.3em] mb-2 uppercase">
        Case File — Verdict
      </div>

      {/* Score header */}
      <div className="flex items-baseline gap-4 mb-6">
        <span className="font-pixel text-2xl text-game-primary neon-glow">{results.totalScore}</span>
        <span className="font-mono text-xs text-game-accent/50">
          PTS — {results.accuracy}% ACCURACY
        </span>
      </div>

      {/* Score breakdown */}
      <div className="grid grid-cols-4 gap-2 mb-6 font-mono text-[10px]">
        <div className="text-center">
          <div className="text-game-success">{results.tp}</div>
          <div className="text-game-accent/30">CAUGHT</div>
        </div>
        <div className="text-center">
          <div className="text-game-accent/60">{results.tn}</div>
          <div className="text-game-accent/30">CLEARED</div>
        </div>
        <div className="text-center">
          <div className="text-game-error">{results.fp}</div>
          <div className="text-game-accent/30">FALSE ACC.</div>
        </div>
        <div className="text-center">
          <div className="text-game-warning">{results.fn}</div>
          <div className="text-game-accent/30">MISSED</div>
        </div>
      </div>

      {/* Verdict per claim */}
      <div className="space-y-3 mb-8">
        {results.verdicts.map((v) => {
          const ann = claimAnnotations[v.claimId];
          const seg = claimMap.get(v.claimId);
          return (
            <div key={v.claimId} className={`verdict-row verdict-row--${v.type}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="verdict-badge">{VERDICT_LABELS[v.type]}</span>
                <span className="font-mono text-[10px] text-game-accent/30">
                  {v.points > 0 ? "+" : ""}
                  {v.points} pts
                </span>
              </div>
              <p className="font-mono text-xs text-game-accent/70 mb-1">
                &ldquo;{seg?.text}&rdquo;
              </p>
              <p className="font-mono text-[10px] text-game-accent/40 italic">
                {ann?.explanation ?? "No explanation available."}
              </p>
            </div>
          );
        })}
      </div>

      {/* Enrichment */}
      <div className="border-t border-game-secondary/30 pt-4 mb-6">
        <div className="font-mono text-[10px] text-game-primary/50 tracking-[0.2em] uppercase mb-2">
          Intel Report
        </div>
        <p className="font-mono text-xs text-game-accent/60 mb-2">
          <strong className="text-game-accent/80">Why it matters:</strong> {enrichment.whyItMatters}
        </p>
        <p className="font-mono text-xs text-game-accent/60 mb-2">
          <strong className="text-game-accent/80">Real case:</strong> {enrichment.realWorldExample}
        </p>
        {enrichment.proTip && (
          <p className="font-mono text-xs text-game-accent/60">
            <strong className="text-game-primary/80">Pro tip:</strong> {enrichment.proTip}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <Button onClick={onNextCase} variant="primary">
          NEXT CASE
        </Button>
        <Button href="/" variant="secondary">
          BACK TO HQ
        </Button>
      </div>
    </motion.div>
  );
}
