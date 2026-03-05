# Changelog

## [0.4.0] — 2026-03-05

### Added
- Phase-reactive Spotlight component (`Spotlight.tsx`) with three modes: ambient, focused, interrogation
- Spotlight tightens from wide vignette → focused cone → harsh interrogation beam as game progresses
- Subtle breathing animation during investigation phase (4s ease-in-out cycle)
- Red-tinged edge pulse during results phase for dramatic noir interrogation feel
- Smooth 0.8s CSS transitions between spotlight phases
- Respects `prefers-reduced-motion` via existing global media query

### Changed
- Replaced static `.spotlight` div with dynamic `<Spotlight>` component on landing and play pages
- Split spotlight CSS into phase-specific classes (`--ambient`, `--focused`, `--interrogation`)

## [0.3.0] — 2026-02-25

### Changed
- Extracted passage selection from play page into `usePassageSelection` hook
- Passages now served in category-diverse order (round-robin interleaving) instead of sequential
- Shuffled within categories for variety across sessions
- Queue auto-rebuilds when all passages exhausted, avoiding same-category start
- Removed `passageIdx` state from play page — selection logic fully encapsulated
- Added session progress counter (e.g. "3/5") to case header

## [0.2.0] — 2026-02-22

### Added
- Playable end-to-end game loop: briefing → investigating → results
- Passage reader with clickable claim spans (flag/unflag toggle)
- Case file results display with per-claim verdicts and explanations
- Noir detective theme: spotlight vignette, case file borders, classified stamp
- Claim interaction styles: neutral underline, flagged strikethrough with red highlight
- Verdict display with color-coded rows (TP/TN/FP/FN)
- Score breakdown grid (caught, cleared, false accusations, missed)
- Enrichment panel showing why-it-matters, real-world examples, pro tips
- 5 starter passages across 2 categories (Obvious Fabrications, Plausible But Wrong)

### Changed
- Landing page updated with noir detective styling and "INVESTIGATE" CTA
- Fixed ESLint errors: impure Date.now() render call, missing next/link usage
- Fixed pre-existing useProgress setState-in-effect lint warning

## [0.1.0] — 2026-02-21

### Added
- Initial scaffold from Passionate Learning template
- Landing page with game identity
- Coming Soon play page placeholder
- Type system for hallucination passages and scoring
- localStorage persistence layer with FSRS spaced repetition
- 5 passages with annotated claims
