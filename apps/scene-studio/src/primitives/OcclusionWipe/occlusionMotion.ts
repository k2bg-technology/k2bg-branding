import { clampUnit } from '../../utils/clampUnit';
import { getSeededRandom } from '../../utils/seededRandom';

// Softness of the defocused silhouette edge.
export const EDGE_SOFTNESS_IN_PX = 48;
// Silhouette size relative to the frame; oversized so the blurred edge still
// covers the corners when the blob is centered.
const SILHOUETTE_BASE_SCALE = 1.9;
const SILHOUETTE_SCALE_JITTER = 0.4;
export const MAX_SILHOUETTE_SCALE =
  SILHOUETTE_BASE_SCALE + SILHOUETTE_SCALE_JITTER;
// Eight-value percentage border radii within this range keep the blob
// irregular without carving into the frame-covering core.
const MIN_CORNER_RADIUS_IN_PERCENT = 30;
const CORNER_RADIUS_RANGE_IN_PERCENT = 40;
const CORNER_COUNT = 8;
const MAX_ROTATION_DRIFT_IN_DEGREES = 6;

const DEGREES_TO_RADIANS = Math.PI / 180;

interface OcclusionOffsetInput {
  progress: number;
  directionInDegrees: number;
  widthInPx: number;
  heightInPx: number;
}

// The silhouette travels along `directionInDegrees` (0 = rightward,
// 90 = downward), centered on the frame at progress 0.5 and fully off-screen
// at both endpoints — including the blurred fringe.
export function getOcclusionOffset({
  progress,
  directionInDegrees,
  widthInPx,
  heightInPx,
}: OcclusionOffsetInput): { xInPx: number; yInPx: number } {
  const clampedProgress = clampUnit(progress);
  const directionInRadians = directionInDegrees * DEGREES_TO_RADIANS;
  const horizontalDirection = Math.cos(directionInRadians);
  const verticalDirection = Math.sin(directionInRadians);

  const frameProjectionInPx =
    Math.abs(widthInPx * horizontalDirection) +
    Math.abs(heightInPx * verticalDirection);
  // The full diagonal bounds the silhouette's projection for every seeded
  // size, travel direction, and drift rotation; the softness margin keeps the
  // blurred fringe off-screen too.
  const silhouetteDiagonalInPx =
    MAX_SILHOUETTE_SCALE * Math.hypot(widthInPx, heightInPx);
  const travelSpanInPx =
    frameProjectionInPx + silhouetteDiagonalInPx + 4 * EDGE_SOFTNESS_IN_PX;

  return {
    xInPx: (clampedProgress - 0.5) * travelSpanInPx * horizontalDirection,
    yInPx: (clampedProgress - 0.5) * travelSpanInPx * verticalDirection,
  };
}

export function getSilhouetteShape(input: { seed: number }): {
  borderRadius: string;
  widthInPercent: number;
  heightInPercent: number;
} {
  const widthScale =
    SILHOUETTE_BASE_SCALE +
    SILHOUETTE_SCALE_JITTER * getSeededRandom(1, input.seed);
  const heightScale =
    SILHOUETTE_BASE_SCALE +
    SILHOUETTE_SCALE_JITTER * getSeededRandom(2, input.seed);
  const cornerRadii = Array.from({ length: CORNER_COUNT }, (_, cornerIndex) =>
    (
      MIN_CORNER_RADIUS_IN_PERCENT +
      CORNER_RADIUS_RANGE_IN_PERCENT *
        getSeededRandom(3 + cornerIndex, input.seed)
    ).toFixed(1)
  );

  return {
    borderRadius: `${cornerRadii[0]}% ${cornerRadii[1]}% ${cornerRadii[2]}% ${cornerRadii[3]}% / ${cornerRadii[4]}% ${cornerRadii[5]}% ${cornerRadii[6]}% ${cornerRadii[7]}%`,
    widthInPercent: widthScale * 100,
    heightInPercent: heightScale * 100,
  };
}

// A touch of rotation across the sweep keeps the silhouette from reading as a
// static cutout; it passes through 0 at mid-sweep so full coverage holds.
export function getSilhouetteRotationInDegrees(input: {
  progress: number;
  seed: number;
}): number {
  const driftDirection = getSeededRandom(11, input.seed) < 0.5 ? -1 : 1;

  return (
    driftDirection *
    MAX_ROTATION_DRIFT_IN_DEGREES *
    (clampUnit(input.progress) - 0.5) *
    2
  );
}
