"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

const phaseMotion = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

interface BriefingPhaseProps {
  onStart: () => void;
}

export function BriefingPhase({ onStart }: BriefingPhaseProps) {
  return (
    <motion.div key="briefing" className="case-file w-full max-w-2xl" {...phaseMotion}>
      <div className="font-mono text-[10px] text-game-primary/50 tracking-[0.3em] mb-2 uppercase">
        Intelligence Briefing
      </div>
      <h2 className="font-pixel text-sm text-game-accent mb-4">INCOMING DOSSIER</h2>
      <p className="font-mono text-sm text-game-accent/70 leading-relaxed mb-6">
        An AI-generated document has been intercepted. Your mission: read the passage and flag
        every claim you believe is a hallucination. Precision matters — false accusations cost
        points.
      </p>
      <div className="flex gap-3 items-center mb-4">
        <span className="claim-chip claim-chip--unflagged">unflagged</span>
        <span className="font-mono text-[10px] text-game-accent/40">= you believe it&apos;s true</span>
      </div>
      <div className="flex gap-3 items-center mb-6">
        <span className="claim-chip claim-chip--flagged">flagged</span>
        <span className="font-mono text-[10px] text-game-accent/40">= you suspect hallucination</span>
      </div>
      <Button onClick={onStart} variant="primary">
        OPEN DOSSIER
      </Button>
    </motion.div>
  );
}
