# HALLUCINATION HUNTER

**Don't Trust. Verify.** — An educational game that teaches AI output evaluation through detecting hallucinations in AI-generated text.

Part of the [Passionate Learning](https://github.com/DareDev256) game series (Game 3/6).

## How It Works

1. Read an AI-generated passage containing highlighted claims
2. Click claims you believe are hallucinations to flag them
3. Submit your verdict — the game reveals which claims were true vs fabricated
4. Score based on precision AND recall (trigger-happy flagging is punished)

Passages are served in **diversity-picked order** — categories alternate so you never see the same type back-to-back, with shuffling within each category for variety. The exclude logic ensures queue rebuilds always start with a different category than the last passage played.

## Scoring

| Result | Points | Meaning |
|--------|--------|---------|
| True Positive | +15 | Correctly flagged a hallucination |
| True Negative | +5 | Correctly left a true claim alone |
| False Positive | -10 | Falsely accused a true claim |
| False Negative | -5 | Missed a hallucination |

## Categories

- **Obvious Fabrications** — Fake dates, wrong names, invented studies
- **Plausible But Wrong** — Close to true but factually incorrect

More categories coming: Number Hallucinations, Citation Hallucinations, Subtle Conflation, Confident Nonsense, Mixed Truth, Domain Traps.

## Tech Stack

- Next.js 16 + React 19 + TypeScript (strict)
- Tailwind CSS v4 (CSS-first `@theme inline`)
- Framer Motion for animations
- localStorage persistence (SSR-safe)
- Zero API keys — all content is pre-written

## Getting Started

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # Production build
npm run lint   # ESLint check
```

## Theme

Noir detective aesthetic — dark blues, reds, spotlight effects, case file UI. Inspired by Papers Please, Return of the Obra Dinn, and classic noir film.

The spotlight is **phase-reactive**: a wide ambient vignette during briefings tightens into a focused desk-lamp cone while investigating, then narrows into a harsh interrogation beam with a subtle red-tinged edge pulse when the verdict drops. Transitions are smooth (0.8s ease-out) with a breathing animation during investigation.

## License

MIT — by [DareDev256](https://github.com/DareDev256)
