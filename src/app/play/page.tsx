"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { passages } from "@/data/passages";
import {
  parsePassage,
  scoreClaims,
  type CaseResults,
  type ParsedClaim,
} from "@/types/hallucination";
import { Button } from "@/components/ui/Button";
import { useProgress } from "@/hooks/useProgress";

type Phase = "briefing" | "investigating" | "results";

export default function PlayPage() {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [passageIdx, setPassageIdx] = useState(0);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<CaseResults | null>(null);
  const { earnXP } = useProgress();

  const passage = passages[passageIdx];
  const segments = useMemo(() => parsePassage(passage.prompt), [passage]);
  const claimCount = useMemo(
    () => Object.keys(passage.claimAnnotations).length,
    [passage]
  );

  const toggleClaim = useCallback((id: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const submitVerdict = useCallback(() => {
    const res = scoreClaims(passage.claimAnnotations, flagged);
    setResults(res);
    setPhase("results");
    if (res.totalScore > 0) earnXP(res.totalScore);
  }, [passage, flagged, earnXP]);

  const nextCase = useCallback(() => {
    const next = (passageIdx + 1) % passages.length;
    setPassageIdx(next);
    setFlagged(new Set());
    setResults(null);
    setPhase("briefing");
  }, [passageIdx]);

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 relative">
      <div className="spotlight" />

      {/* Header bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <Link
          href="/"
          className="font-pixel text-[10px] text-game-primary/60 hover:text-game-primary transition-colors"
        >
          &lt; HQ
        </Link>
        <span className="font-mono text-[10px] text-game-secondary tracking-widest uppercase">
          Case {passage.id} — {passage.category.replace(/-/g, " ")}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* ─── BRIEFING ─── */}
        {phase === "briefing" && (
          <motion.div
            key="briefing"
            className="case-file w-full max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="font-mono text-[10px] text-game-primary/50 tracking-[0.3em] mb-2 uppercase">
              Intelligence Briefing
            </div>
            <h2 className="font-pixel text-sm text-game-accent mb-4">
              INCOMING DOSSIER
            </h2>
            <p className="font-mono text-sm text-game-accent/70 leading-relaxed mb-6">
              An AI-generated document has been intercepted. Your mission: read
              the passage and flag every claim you believe is a hallucination.
              Precision matters — false accusations cost points.
            </p>
            <div className="flex gap-3 items-center mb-4">
              <span className="claim-chip claim-chip--unflagged">
                unflagged
              </span>
              <span className="font-mono text-[10px] text-game-accent/40">
                = you believe it&apos;s true
              </span>
            </div>
            <div className="flex gap-3 items-center mb-6">
              <span className="claim-chip claim-chip--flagged">flagged</span>
              <span className="font-mono text-[10px] text-game-accent/40">
                = you suspect hallucination
              </span>
            </div>
            <Button onClick={() => setPhase("investigating")} variant="primary">
              OPEN DOSSIER
            </Button>
          </motion.div>
        )}

        {/* ─── INVESTIGATING ─── */}
        {phase === "investigating" && (
          <motion.div
            key="investigating"
            className="case-file w-full max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="font-mono text-[10px] text-game-primary/50 tracking-[0.3em] mb-4 uppercase">
              Document Under Review
            </div>

            {/* Passage with clickable claims */}
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
                    onClick={() => toggleClaim(claim.id)}
                    className={`claim-span ${isFlagged ? "claim-span--flagged" : "claim-span--neutral"}`}
                    aria-pressed={isFlagged}
                    aria-label={`Claim: ${claim.text}. ${isFlagged ? "Flagged as hallucination" : "Not flagged"}`}
                  >
                    {claim.text}
                  </button>
                );
              })}
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between border-t border-game-secondary/30 pt-4">
              <span className="font-mono text-[10px] text-game-accent/40">
                {flagged.size}/{claimCount} claims flagged
              </span>
              <Button onClick={submitVerdict} variant="primary">
                SUBMIT VERDICT
              </Button>
            </div>
          </motion.div>
        )}

        {/* ─── RESULTS ─── */}
        {phase === "results" && results && (
          <motion.div
            key="results"
            className="case-file w-full max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="font-mono text-[10px] text-game-primary/50 tracking-[0.3em] mb-2 uppercase">
              Case File — Verdict
            </div>

            {/* Score header */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-pixel text-2xl text-game-primary neon-glow">
                {results.totalScore}
              </span>
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
                const ann = passage.claimAnnotations[v.claimId];
                const seg = segments.find(
                  (s) => typeof s !== "string" && (s as ParsedClaim).id === v.claimId
                ) as ParsedClaim | undefined;
                return (
                  <div
                    key={v.claimId}
                    className={`verdict-row verdict-row--${v.type}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="verdict-badge">
                        {v.type === "tp"
                          ? "✓ CAUGHT"
                          : v.type === "tn"
                            ? "✓ CLEARED"
                            : v.type === "fp"
                              ? "✗ FALSE ACC."
                              : "✗ MISSED"}
                      </span>
                      <span className="font-mono text-[10px] text-game-accent/30">
                        {v.points > 0 ? "+" : ""}
                        {v.points} pts
                      </span>
                    </div>
                    <p className="font-mono text-xs text-game-accent/70 mb-1">
                      &ldquo;{seg?.text}&rdquo;
                    </p>
                    <p className="font-mono text-[10px] text-game-accent/40 italic">
                      {ann.explanation}
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
                <strong className="text-game-accent/80">Why it matters:</strong>{" "}
                {passage.enrichment.whyItMatters}
              </p>
              <p className="font-mono text-xs text-game-accent/60 mb-2">
                <strong className="text-game-accent/80">Real case:</strong>{" "}
                {passage.enrichment.realWorldExample}
              </p>
              {passage.enrichment.proTip && (
                <p className="font-mono text-xs text-game-accent/60">
                  <strong className="text-game-primary/80">Pro tip:</strong>{" "}
                  {passage.enrichment.proTip}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button onClick={nextCase} variant="primary">
                NEXT CASE
              </Button>
              <Button href="/" variant="secondary">
                BACK TO HQ
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
