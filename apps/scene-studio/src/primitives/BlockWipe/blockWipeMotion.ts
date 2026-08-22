import { clampUnit } from '../../utils/clampUnit';

interface BandProgressInput {
  bandIndex: number;
  bandCount: number;
  coverage: number;
  staggerShare: number;
}

// Stretching the travel by the total lag keeps every band at 0 on coverage 0
// and at 1 on coverage 1, so both endpoints stay clean mount/unmount
// boundaries while the bands still lag one another in between.
export function getBandProgress({
  bandIndex,
  bandCount,
  coverage,
  staggerShare,
}: BandProgressInput): number {
  const clampedCoverage = clampUnit(coverage);
  // Snap the upper endpoint: floating-point drift in the stretched travel
  // leaves trailing bands a hair short of 1 and shows a seam at full coverage.
  if (clampedCoverage >= 1) {
    return 1;
  }

  const totalSpan = 1 + (bandCount - 1) * staggerShare;

  return clampUnit(clampedCoverage * totalSpan - bandIndex * staggerShare);
}

interface Point {
  xInPercent: number;
  yInPercent: number;
}

const RECTANGLE_CORNERS: readonly Point[] = [
  { xInPercent: 0, yInPercent: 0 },
  { xInPercent: 100, yInPercent: 0 },
  { xInPercent: 100, yInPercent: 100 },
  { xInPercent: 0, yInPercent: 100 },
];

const EMPTY_CLIP_PATH = 'polygon(0% 0%, 0% 0%, 0% 0%)';
// Relative slack so the corners sitting exactly on the travel front survive
// the rounding of `minimum + progress * span` at progress 1.
const PROJECTION_TOLERANCE_SHARE = 1e-9;
const COORDINATE_PRECISION = 3;

function formatCoordinate(value: number): string {
  return `${Number(value.toFixed(COORDINATE_PRECISION))}%`;
}

function getCrossingPoint(
  from: Point,
  to: Point,
  fromProjection: number,
  toProjection: number,
  threshold: number
): Point {
  const span = toProjection - fromProjection;
  const share = span === 0 ? 0 : (threshold - fromProjection) / span;

  return {
    xInPercent: from.xInPercent + share * (to.xInPercent - from.xInPercent),
    yInPercent: from.yInPercent + share * (to.yInPercent - from.yInPercent),
  };
}

interface WipeClipPathInput {
  progress: number;
  directionInDegrees: number;
  canvasAspect: number;
}

// The covered region is the half of the frame behind a straight front that
// travels along `directionInDegrees` (0 = rightward, 90 = downward).
export function getWipeClipPathPolygon({
  progress,
  directionInDegrees,
  canvasAspect,
}: WipeClipPathInput): string {
  const clampedProgress = clampUnit(progress);
  if (clampedProgress <= 0) {
    return EMPTY_CLIP_PATH;
  }

  const directionInRadians = (directionInDegrees * Math.PI) / 180;
  const horizontalDirection = Math.cos(directionInRadians);
  const verticalDirection = Math.sin(directionInRadians);
  // Percent space is anisotropic on a 9:16 canvas; scaling x by the aspect
  // ratio makes the travel angle read as a true on-screen angle.
  const project = (point: Point) =>
    point.xInPercent * canvasAspect * horizontalDirection +
    point.yInPercent * verticalDirection;

  const cornerProjections = RECTANGLE_CORNERS.map(project);
  const minimumProjection = Math.min(...cornerProjections);
  const maximumProjection = Math.max(...cornerProjections);
  const projectionSpan = maximumProjection - minimumProjection;
  const threshold = minimumProjection + clampedProgress * projectionSpan;
  const tolerance = projectionSpan * PROJECTION_TOLERANCE_SHARE;

  // Sutherland–Hodgman clip of the frame rectangle against the half-plane
  // that lies behind the front.
  const coveredCorners = RECTANGLE_CORNERS.flatMap((corner, cornerIndex) => {
    const previousCorner =
      RECTANGLE_CORNERS[
        (cornerIndex + RECTANGLE_CORNERS.length - 1) % RECTANGLE_CORNERS.length
      ];
    const cornerProjection = cornerProjections[cornerIndex];
    const previousProjection =
      cornerProjections[
        (cornerIndex + RECTANGLE_CORNERS.length - 1) % RECTANGLE_CORNERS.length
      ];
    const isCovered = cornerProjection <= threshold + tolerance;
    const wasCovered = previousProjection <= threshold + tolerance;

    if (isCovered === wasCovered) {
      return isCovered ? [corner] : [];
    }

    const crossing = getCrossingPoint(
      previousCorner,
      corner,
      previousProjection,
      cornerProjection,
      threshold
    );

    return isCovered ? [crossing, corner] : [crossing];
  });

  const vertices = coveredCorners
    .map(
      (point) =>
        `${formatCoordinate(point.xInPercent)} ${formatCoordinate(point.yInPercent)}`
    )
    .join(', ');

  return `polygon(${vertices})`;
}
