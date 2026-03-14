# Changelog

## [0.6.1] — 2026-03-14

### Security
- Added HTTP security headers via `next.config.ts`: Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- Hardened all localStorage write functions (`addXP`, `completeLevel`, `updateItemScore`, `saveFSRSCard`, `recordMasteryAttempt`, `recordLearningEvent`) with input validation — NaN/Infinity rejection, control character stripping, range clamping
- Added `sanitizeId()` utility that strips control characters (U+0000–U+001F, U+007F–U+009F) and caps length on all string identifiers before storage
- `saveFSRSCard` now validates and clamps all numeric fields before write and enforces a 10K card cap to prevent storage bombs
- `recordLearningEvent` rebuilds the event object from scratch with sanitized fields, preventing property injection from tainted upstream callers
- Added 16-test input validation suite covering NaN, Infinity, control chars, empty IDs, and field clamping across all write functions

## [0.6.0] — 2026-03-13

### Changed
- Replaced per-component `useProgress` hook (independent `useState` copies in 3 route pages) with a single `ProgressProvider` context backed by `useReducer`
- All progress mutations now go through a serialized `mutate()` wrapper that re-reads from localStorage as the source of truth, preventing React 18/19 batching from causing stale state across pages
- `useProgress.ts` hook file is now a thin re-export from the provider for import path compatibility
- `isCategoryUnlocked` accepts categories as a parameter instead of requiring them at hook construction time

### Added
- Cross-tab sync via `storage` event listener — progress changes in one tab propagate to all other open tabs automatically
- `AbortController` guards on both initial load and storage listener for clean teardown on unmount
- Error boundary: `useProgress()` throws a descriptive error if used outside `<ProgressProvider>`

## [0.5.0] — 2026-03-11

### Changed
- Extracted play page into three phase components: `BriefingPhase`, `InvestigatingPhase`, `ResultsPhase`
- Play page reduced from 293 → 95 lines — now pure orchestration (state + routing between phases)
- Shared `phaseMotion` config object replaces duplicated Framer Motion props across all three phases
- Spotlight phase mapping extracted to a `SPOTLIGHT_MAP` constant, eliminating nested ternary
- Verdict label strings extracted to `VERDICT_LABELS` lookup in `ResultsPhase`, replacing inline ternary chain

## [0.4.5] — 2026-03-10

### Fixed
- Timer progress bar: guarded against `duration=0` which produced `Infinity%` CSS width (silent visual corruption on the bar element)
- Results verdict: added null-safe access for `claimAnnotations` lookup preventing runtime crash if a verdict references a missing claim ID
- Removed unused `_STREAK_FREEZE_KEY` constant that triggered ESLint no-unused-vars warning (streak freezes are tracked in `UserProgress`, not a standalone key)

## [0.4.4] — 2026-03-08

### Added
- Unit test suite (23 tests) covering diversity-queue logic (`shuffle`, `declump`, `buildDiverseQueue`), passage parser, and scoring engine
- Vitest test runner with TypeScript path alias support
- `npm run test` script
- Exported pure functions from `usePassageSelection` for testability; `buildDiverseQueue` now accepts an optional passage pool parameter

## [0.4.3] — 2026-03-08

### Fixed
- Diversity queue tail clumping: uneven category sizes (3 vs 2) caused consecutive same-category passages at the queue tail ~50% of the time
- Round-robin now leads with the largest category and applies a post-pass declump sweep to break any remaining consecutive same-category runs
- Exclude logic swaps to position 1 instead of pushing to end, preserving interleave balance across queue rebuilds
- Added empty-passages guard to prevent infinite loop in `buildDiverseQueue`
- Fixed misleading "deterministic seeded shuffle" docstring (shuffle uses `Math.random`, not a seed)

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
