import { getSeededRandom } from '../../utils/seededRandom';

export type HudMarkKind = 'plus' | 'tick' | 'rule' | 'dot';

const HUD_MARK_KINDS: readonly HudMarkKind[] = ['plus', 'tick', 'rule', 'dot'];
// Only the linear marks read as tilted; a plus or a dot would look misaligned.
const TILTED_MARK_KINDS: readonly HudMarkKind[] = ['tick', 'rule'];

// Base positions stay inside this margin so the drift never clips a mark.
const EDGE_MARGIN_IN_PERCENT = 4;
const DRIFT_AMPLITUDE_IN_PERCENT = 0.6;
const MINIMUM_SIZE_IN_PX = 4;
const SIZE_RANGE_IN_PX = 10;
const MINIMUM_OPACITY = 0.25;
const MAXIMUM_TILT_IN_DEGREES = 12;
const TWO_PI = Math.PI * 2;

interface HudMarkStateInput {
  markIndex: number;
  frame: number;
  seed?: number;
}

export function getHudMarkState({
  markIndex,
  frame,
  seed = 0,
}: HudMarkStateInput) {
  const markKey = markIndex + 1;
  const kind =
    HUD_MARK_KINDS[
      Math.floor(getSeededRandom(markKey, seed) * HUD_MARK_KINDS.length)
    ];

  const spanInPercent = 100 - 2 * EDGE_MARGIN_IN_PERCENT;
  const baseXInPercent =
    EDGE_MARGIN_IN_PERCENT +
    getSeededRandom(3 * markKey + 1, seed) * spanInPercent;
  const baseYInPercent =
    EDGE_MARGIN_IN_PERCENT +
    getSeededRandom(3 * markKey + 2, seed) * spanInPercent;
  const driftFrequency = 0.01 + 0.02 * getSeededRandom(markKey + 7, seed);
  const driftPhase = TWO_PI * getSeededRandom(markKey + 11, seed);
  const blinkFrequency = 0.05 + 0.12 * getSeededRandom(markKey + 13, seed);
  const blinkPhase = TWO_PI * getSeededRandom(markKey + 17, seed);

  return {
    kind,
    xInPercent:
      baseXInPercent +
      DRIFT_AMPLITUDE_IN_PERCENT *
        Math.sin(frame * driftFrequency + driftPhase),
    yInPercent:
      baseYInPercent +
      DRIFT_AMPLITUDE_IN_PERCENT *
        Math.cos(frame * driftFrequency + driftPhase),
    sizeInPx:
      MINIMUM_SIZE_IN_PX +
      SIZE_RANGE_IN_PX * getSeededRandom(3 * markKey + 3, seed),
    rotationInDegrees: TILTED_MARK_KINDS.includes(kind)
      ? (getSeededRandom(markKey + 19, seed) - 0.5) *
        2 *
        MAXIMUM_TILT_IN_DEGREES
      : 0,
    opacity:
      MINIMUM_OPACITY +
      (1 - MINIMUM_OPACITY) *
        (0.5 + 0.5 * Math.sin(frame * blinkFrequency + blinkPhase)),
  };
}

const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;

interface TimecodeInput {
  frame: number;
  fps: number;
}

function padToTwoDigits(value: number): string {
  return value.toString().padStart(2, '0');
}

export function formatTimecode({ frame, fps }: TimecodeInput): string {
  const framesPerSecond = Math.max(1, Math.round(fps));
  const totalFrames = Math.max(0, Math.floor(frame));
  const totalSeconds = Math.floor(totalFrames / framesPerSecond);

  return [
    Math.floor(totalSeconds / SECONDS_PER_HOUR),
    Math.floor(totalSeconds / SECONDS_PER_MINUTE) % MINUTES_PER_HOUR,
    totalSeconds % SECONDS_PER_MINUTE,
    totalFrames % framesPerSecond,
  ]
    .map(padToTwoDigits)
    .join(':');
}
