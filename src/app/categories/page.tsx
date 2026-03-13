"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { categories } from "@/data/curriculum";
import { useProgress } from "@/hooks/useProgress";
import { Button } from "@/components/ui/Button";

export default function CategoriesPage() {
  const { progress, isLoading, isLevelUnlocked, isCategoryUnlocked } =
    useProgress();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-pixel text-xs text-game-primary animate-pulse-neon">
          LOADING...
        </p>
      </main>
    );
  }

  function getCategoryCompletion(categoryId: string): {
    completed: number;
    total: number;
    percent: number;
  } {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !progress) return { completed: 0, total: 0, percent: 0 };
    const total = category.levels.length;
    const completed = category.levels.filter((level) =>
      progress.completedLevels.includes(`${categoryId}-${level.id}`)
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percent };
  }

  function getLevelPassageCount(categoryId: string, levelId: number): number {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return 0;
    const level = category.levels.find((l) => l.id === levelId);
    return level?.items.length ?? 0;
  }

  function isLevelComplete(categoryId: string, levelId: number): boolean {
    if (!progress) return false;
    return progress.completedLevels.includes(`${categoryId}-${levelId}`);
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-4 md:p-8 relative">
      <div className="spotlight" />

      {/* Decorative corners */}
      <div className="fixed top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-game-primary/40" />
      <div className="fixed top-4 right-16 w-12 h-12 border-t-2 border-r-2 border-game-primary/40" />
      <div className="fixed bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-game-primary/40" />
      <div className="fixed bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-game-primary/40" />

      {/* Header */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-8 relative z-10">
        <Link
          href="/"
          className="font-pixel text-[10px] text-game-primary/60 hover:text-game-primary transition-colors"
        >
          &lt; HQ
        </Link>
        <motion.div
          className="font-pixel text-[10px] text-game-primary/20 rotate-6 border border-game-primary/20 px-3 py-1 select-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
        >
          CLASSIFIED
        </motion.div>
      </div>

      {/* Title */}
      <motion.div
        className="text-center mb-10 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-pixel text-xl md:text-2xl text-game-primary neon-glow mb-3">
          CASE FILES
        </h1>
        <p className="font-mono text-[10px] text-game-secondary tracking-[0.3em] uppercase">
          AI Crimes Division — Active Investigations
        </p>
      </motion.div>

      {/* Category grid */}
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {categories.map((category, catIndex) => {
          const unlocked = isCategoryUnlocked(category.id, categories);
          const { completed, total, percent } = getCategoryCompletion(
            category.id
          );
          const isExpanded = expandedCategory === category.id;
          const hasItems = category.levels.some((l) => l.items.length > 0);

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * catIndex, type: "spring", stiffness: 100 }}
              className="flex flex-col"
            >
              {/* Category card */}
              <motion.button
                onClick={() => {
                  if (!unlocked) return;
                  setExpandedCategory(isExpanded ? null : category.id);
                }}
                className={`case-file text-left w-full transition-colors ${
                  unlocked
                    ? "cursor-pointer hover:border-game-primary"
                    : "cursor-not-allowed opacity-40"
                } ${isExpanded ? "border-game-primary" : ""}`}
                whileHover={unlocked ? { scale: 1.02 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                aria-expanded={isExpanded}
                aria-disabled={!unlocked}
              >
                {/* Category header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-pixel text-lg text-game-primary neon-glow">
                      {unlocked ? category.icon : "//"}
                    </span>
                    <div>
                      <h2 className="font-pixel text-[10px] md:text-xs text-game-accent">
                        {unlocked ? category.title.toUpperCase() : "LOCKED"}
                      </h2>
                      {!unlocked && (
                        <p className="font-mono text-[8px] text-game-accent/30 mt-1">
                          Complete previous category to unlock
                        </p>
                      )}
                    </div>
                  </div>
                  {unlocked && (
                    <span className="font-mono text-[10px] text-game-accent/30">
                      {isExpanded ? "[-]" : "[+]"}
                    </span>
                  )}
                </div>

                {/* Description */}
                {unlocked && (
                  <p className="font-mono text-[10px] text-game-accent/50 leading-relaxed mb-4">
                    {category.description}
                  </p>
                )}

                {/* Progress bar */}
                {unlocked && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-game-secondary/30 overflow-hidden">
                      <motion.div
                        className="h-full bg-game-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ delay: 0.3 + 0.15 * catIndex, duration: 0.6 }}
                      />
                    </div>
                    <span className="font-mono text-[9px] text-game-accent/40 whitespace-nowrap">
                      {completed}/{total}
                    </span>
                    {percent === 100 && (
                      <span className="font-pixel text-[8px] text-game-success">
                        CLEAR
                      </span>
                    )}
                  </div>
                )}

                {/* Level count + passage count */}
                {unlocked && hasItems && (
                  <div className="flex gap-4 mt-3">
                    <span className="font-mono text-[9px] text-game-secondary">
                      {total} LEVEL{total !== 1 ? "S" : ""}
                    </span>
                    <span className="font-mono text-[9px] text-game-secondary">
                      {category.levels.reduce((acc, l) => acc + l.items.length, 0)} CASE{category.levels.reduce((acc, l) => acc + l.items.length, 0) !== 1 ? "S" : ""}
                    </span>
                  </div>
                )}
              </motion.button>

              {/* Expanded levels */}
              <AnimatePresence>
                {isExpanded && unlocked && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="overflow-hidden"
                  >
                    <div className="border-l-3 border-l border-game-primary/30 ml-4 mt-2 space-y-2">
                      {category.levels.map((level) => {
                        const levelUnlocked = isLevelUnlocked(
                          category.id,
                          level.id
                        );
                        const levelComplete = isLevelComplete(
                          category.id,
                          level.id
                        );
                        const passageCount = getLevelPassageCount(
                          category.id,
                          level.id
                        );

                        return (
                          <motion.div
                            key={level.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * level.id }}
                            className={`pl-4 py-2 pr-3 flex items-center justify-between ${
                              levelUnlocked
                                ? "hover:bg-game-secondary/10"
                                : "opacity-30"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {/* Status indicator */}
                              <span
                                className={`font-pixel text-[8px] ${
                                  levelComplete
                                    ? "text-game-success"
                                    : levelUnlocked
                                      ? "text-game-primary"
                                      : "text-game-accent/20"
                                }`}
                              >
                                {levelComplete
                                  ? "[x]"
                                  : levelUnlocked
                                    ? "[ ]"
                                    : "[=]"}
                              </span>

                              <div>
                                <span className="font-mono text-[10px] text-game-accent/80">
                                  {level.name}
                                </span>
                                <span className="font-mono text-[8px] text-game-accent/30 ml-2">
                                  {passageCount > 0
                                    ? `${passageCount} case${passageCount !== 1 ? "s" : ""}`
                                    : "coming soon"}
                                </span>
                              </div>
                            </div>

                            {levelUnlocked && passageCount > 0 ? (
                              <Link
                                href={`/play?category=${category.id}&level=${level.id}`}
                                className="font-pixel text-[8px] text-game-primary hover:text-game-accent transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {levelComplete ? "REPLAY" : "PLAY"}
                              </Link>
                            ) : (
                              <span className="font-pixel text-[8px] text-game-accent/15">
                                {passageCount === 0 ? "TBD" : "LOCKED"}
                              </span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Back button */}
      <motion.div
        className="mt-10 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button href="/" variant="secondary">
          BACK TO HQ
        </Button>
      </motion.div>

      {/* Footer */}
      <motion.p
        className="font-pixel text-[8px] text-game-primary/40 mt-8 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        PASSIONATE LEARNING by DAREDEV256
      </motion.p>
    </main>
  );
}
