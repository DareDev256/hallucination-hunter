"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { XPBar } from "@/components/ui/XPBar";
import { useProgress } from "@/hooks/useProgress";

const GAME_TITLE = "HALLUCINATION HUNTER";
const GAME_SUBTITLE = "Don't Trust. Verify.";
const GAME_TAGLINE = "SPOT THE LIE";

export default function Home() {
  const { progress, isLoading } = useProgress();

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-pixel text-xs text-game-primary animate-pulse-neon">
          LOADING...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Noir spotlight effect */}
      <div className="spotlight" />

      {/* Decorative corners — case file edges */}
      <div className="fixed top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-game-primary/40" />
      <div className="fixed top-4 right-16 w-12 h-12 border-t-2 border-r-2 border-game-primary/40" />
      <div className="fixed bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-game-primary/40" />
      <div className="fixed bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-game-primary/40" />

      {/* Classified stamp */}
      <motion.div
        className="absolute top-8 right-8 font-pixel text-[10px] text-game-primary/20 rotate-12 border border-game-primary/20 px-3 py-1 select-none"
        initial={{ opacity: 0, scale: 0.5, rotate: 25 }}
        animate={{ opacity: 1, scale: 1, rotate: 12 }}
        transition={{ delay: 1.2, type: "spring" }}
      >
        CLASSIFIED
      </motion.div>

      {progress && <StreakBadge streak={progress.streak} />}

      <Logo title={GAME_TITLE} subtitle={GAME_SUBTITLE} />

      {/* Case number */}
      <motion.p
        className="font-mono text-[10px] text-game-secondary tracking-[0.3em] mb-6 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.4 }}
      >
        AI Crimes Division — Active Investigations
      </motion.p>

      {progress && <XPBar xp={progress.xp} level={progress.level} />}

      <motion.div
        className="flex flex-col gap-4 items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Button href="/play" variant="primary">
          INVESTIGATE
        </Button>
        <Button href="/categories" variant="secondary">
          CASE FILES
        </Button>
      </motion.div>

      <motion.p
        className="font-pixel text-[8px] text-game-accent/60 mt-12 animate-blink"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {GAME_TAGLINE}
      </motion.p>

      <motion.p
        className="font-pixel text-[8px] text-game-primary/40 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        PASSIONATE LEARNING by DAREDEV256
      </motion.p>
    </main>
  );
}
