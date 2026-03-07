# Changelog

## [0.4.2] — 2026-03-07

### Security
- Hardened all localStorage JSON parsing in `storage.ts` against prototype pollution (`__proto__`, `constructor`, `prototype` keys stripped on parse)
- Added `validateProgress()` with full schema validation — every field type-checked, numbers clamped to safe bounds, arrays/objects capped at 10K entries to prevent memory bombs
- FSRS card deserialization now validates each card's shape and rejects malformed entries instead of trusting raw JSON
- Mastery and analytics parsers use `safeParseJSON` with type guards instead of raw `JSON.parse` casts
- Sound settings validated with range clamping (volume 0-1, boolean type check) instead of blind spread
- Added `isValidLearningEvent` type guard to reject invalid analytics events at write and read boundaries

## [0.4.1] — 2026-03-06

### Fixed
- Diversity queue exclude logic: `idx > 0` silently skipped exclusion when the last-played category landed at index 0 after shuffling, causing back-to-back same-category passages ~50% of the time with 2 categories
- Replaced O(n) `segments.find()` per verdict in results phase with a pre-built `Map<string, ParsedClaim>` for O(1) claim lookups

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
