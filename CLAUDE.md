# CLAUDE.md — Hallucination Hunter

## Project: Passionate Learning Game #3
A web-based educational game that teaches AI output evaluation through detecting hallucinations.

## Game Identity
- **Title**: HALLUCINATION HUNTER
- **Subtitle**: Don't Trust. Verify.
- **Tagline**: SPOT THE LIE
- **Storage key prefix**: `hallucination_hunter`

## Full Spec
Read `/Users/tdot/Documents/Projects/passionate-learning/specs/03-hallucination-hunter.md` for the complete game specification.

## Tech Stack
- Next.js 16 + React 19 + TypeScript (strict)
- Tailwind CSS v4 (CSS-first `@theme inline`)
- Framer Motion for animations
- localStorage persistence (SSR-safe)
- Deploy: Vercel

## Template
Scaffolded from Passionate Learning shared template at `/Users/tdot/Documents/Projects/passionate-learning/template/`.

## Theme Colors
```css
--game-primary: #e74c3c;   /* red */
--game-secondary: #2c3e50; /* dark blue */
--game-accent: #ecf0f1;    /* light gray */
--game-dark: #0a0a15;
```

## Core Mechanic
Player reads AI-generated passage → clickable claim spans → mark false claims as hallucinated → scoring rewards precision AND recall (trigger-happy flagging is punished).

## Build Priority
1. Landing page with noir detective theme
2. Passage renderer with clickable claim spans
3. Claim toggle UI (flag/unflag with visual feedback)
4. Scoring engine (TP/TN/FP/FN weighted scoring)
5. Case file results display
6. Detective rank progression
7. Full curriculum (120 passages, ~500 claims across 8 categories)
8. Polish (magnifying glass cursor, evidence board)

## Quality Bar
- Production-grade. No placeholders.
- Zero API keys required — all passages and claims are pre-written.
- Mobile responsive — claims must have large enough tap targets.

## Commands
```bash
npm run dev    # Development server
npm run build  # Production build
npm run lint   # ESLint check
```
