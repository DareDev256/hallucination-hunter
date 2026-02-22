"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PlayPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg"
      >
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: "var(--game-primary)", fontFamily: "'Press Start 2P', monospace", textShadow: "0 0 20px var(--game-primary)" }}
        >
          COMING SOON
        </h1>
        <p
          className="text-lg mb-2"
          style={{ color: "var(--game-secondary)", fontFamily: "'Press Start 2P', monospace", fontSize: "0.7rem" }}
        >
          PASSION IS BUILDING THIS
        </p>
        <p className="text-gray-400 mb-8 leading-relaxed" style={{ fontFamily: "monospace" }}>
          Hallucination Hunter&apos;s case files are being prepared right now.
          Passion&apos;s working on it autonomously — check back soon to start your first investigation.
        </p>

        <div className="flex flex-col gap-4 items-center">
          <Link
            href="/"
            className="px-6 py-3 border-2 font-bold text-sm tracking-wider transition-all hover:scale-105"
            style={{
              borderColor: "var(--game-primary)",
              color: "var(--game-primary)",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "0.65rem",
            }}
          >
            &lt; BACK TO HOME
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
