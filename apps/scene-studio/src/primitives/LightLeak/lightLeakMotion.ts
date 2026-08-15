// Incommensurate frequencies and phases keep the two washes from syncing up.
const LIGHT_LEAK_WASHES = [
  {
    name: 'ember',
    anchorXInPercent: 15,
    anchorYInPercent: 20,
    radiusInPercent: 70,
    driftXPhase: 0.6,
    driftYPhase: 2.1,
    pulsePhase: 0.9,
    color: { red: 255, green: 166, blue: 77 },
  },
  {
    name: 'rose',
    anchorXInPercent: 85,
    anchorYInPercent: 75,
    radiusInPercent: 85,
    driftXPhase: 3.7,
    driftYPhase: 5.2,
    pulsePhase: 4.4,
    color: { red: 255, green: 118, blue: 148 },
  },
] as const;
const PULSE_PERIOD_IN_FRAMES = 180;
// Flare pulses, not a constant wash: scenes stay clear between brief peaks.
const BASE_OPACITY = 0.02;
const PULSE_PEAK_OPACITY = 0.4;

function getPulseBell(frame: number, pulsePhase: number): number {
  const wave = Math.sin(
    (frame * 2 * Math.PI) / PULSE_PERIOD_IN_FRAMES + pulsePhase
  );

  // The fourth power sharpens the positive half-wave into a short flare.
  return Math.max(0, wave) ** 4;
}

export function getLightLeakMotion(frame: number) {
  return LIGHT_LEAK_WASHES.map((wash) => ({
    name: wash.name,
    color: wash.color,
    centerXInPercent:
      wash.anchorXInPercent + 18 * Math.sin(frame * 0.009 + wash.driftXPhase),
    centerYInPercent:
      wash.anchorYInPercent + 14 * Math.sin(frame * 0.007 + wash.driftYPhase),
    radiusInPercent: wash.radiusInPercent,
    opacity:
      BASE_OPACITY +
      (PULSE_PEAK_OPACITY - BASE_OPACITY) *
        getPulseBell(frame, wash.pulsePhase),
  }));
}
