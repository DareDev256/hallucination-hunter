"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { parsePassage, scoreClaims, type CaseResults, type ParsedClaim } from "@/types/hallucination";
import { Spotlight } from "@/components/ui/Spotlight";
import { BriefingPhase } from "@/components/game/BriefingPhase";
import { InvestigatingPhase } from "@/components/game/InvestigatingPhase";
import { ResultsPhase } from "@/components/game/ResultsPhase";
import { useProgress } from "@/hooks/useProgress";
import { usePassageSelection } from "@/hooks/usePassageSelection";

type Phase = "briefing" | "investigating" | "results";

const SPOTLIGHT_MAP: Record<Phase, "ambient" | "focused" | "interrogation"> = {
  briefing: "ambient",
  investigating: "focused",
  results: "interrogation",
};

export default function PlayPage() {
  const [phase, setPhase] = useState<Phase>("briefing");
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<CaseResults | null>(null);
  const { earnXP } = useProgress();
  const { current: passage, played, total, advance } = usePassageSelection();

  const segments = useMemo(() => parsePassage(passage.prompt), [passage]);
  const claimMap = useMemo(() => {
    const map = new Map<string, ParsedClaim>();
    for (const seg of segments) {
      if (typeof seg !== "string") map.set((seg as ParsedClaim).id, seg as ParsedClaim);
    }
    return map;
  }, [segments]);
  const claimCount = useMemo(() => Object.keys(passage.claimAnnotations).length, [passage]);

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
    advance();
    setFlagged(new Set());
    setResults(null);
    setPhase("briefing");
  }, [advance]);

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 relative">
      <Spotlight phase={SPOTLIGHT_MAP[phase]} />

      {/* Header bar */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <Link
          href="/"
          className="font-pixel text-[10px] text-game-primary/60 hover:text-game-primary transition-colors"
        >
          &lt; HQ
        </Link>
        <span className="font-mono text-[10px] text-game-secondary tracking-widest uppercase">
          Case {passage.id} — {passage.category.replace(/-/g, " ")}{" "}
          <span className="text-game-accent/20">({played + 1}/{total})</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === "briefing" && (
          <BriefingPhase onStart={() => setPhase("investigating")} />
        )}
        {phase === "investigating" && (
          <InvestigatingPhase
            segments={segments}
            flagged={flagged}
            claimCount={claimCount}
            onToggleClaim={toggleClaim}
            onSubmit={submitVerdict}
          />
        )}
        {phase === "results" && results && (
          <ResultsPhase
            results={results}
            claimMap={claimMap}
            claimAnnotations={passage.claimAnnotations}
            enrichment={passage.enrichment}
            onNextCase={nextCase}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
