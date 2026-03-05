type SpotlightPhase = "ambient" | "focused" | "interrogation";

interface SpotlightProps {
  phase?: SpotlightPhase;
}

/**
 * Dynamic noir spotlight overlay. Shifts from a wide ambient vignette
 * to a tight interrogation beam based on game phase.
 *
 * - ambient:       wide, soft vignette (landing / briefing)
 * - focused:       tighter cone, subtle breathing pulse (investigating)
 * - interrogation: harsh narrow beam, red-tinged edge pulse (results)
 */
export function Spotlight({ phase = "ambient" }: SpotlightProps) {
  return (
    <div
      className={`spotlight spotlight--${phase}`}
      role="presentation"
      aria-hidden="true"
    />
  );
}
