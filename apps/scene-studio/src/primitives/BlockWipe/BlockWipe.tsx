import { AbsoluteFill, useVideoConfig } from 'remotion';

import { clampUnit } from '../../utils/clampUnit';
import { cn } from '../../utils/cn';
import { getBandProgress, getWipeClipPathPolygon } from './blockWipeMotion';

const DEFAULT_COLORS = [
  'var(--color-accent-default)',
  'var(--color-main-default)',
  'var(--color-base-black)',
];

interface Props {
  coverage: number;
  directionInDegrees?: number;
  colors?: string[];
  staggerShare?: number;
  className?: string;
}

// A flat-color band wipe meant to sit above a scene: coverage 0 renders
// nothing and coverage 1 covers the frame, so both endpoints are invisible
// mount/unmount boundaries for transitions. Bands are clipped in the DOM
// rather than drawn on the GPU to keep the diagonal edges crisp.
export function BlockWipe({
  coverage,
  directionInDegrees = 25,
  colors = DEFAULT_COLORS,
  staggerShare = 0.18,
  className,
}: Props) {
  const { width, height } = useVideoConfig();

  const clampedCoverage = clampUnit(coverage);
  if (clampedCoverage <= 0) {
    return null;
  }

  const bands = colors
    .map((color, bandIndex) => ({
      color,
      bandIndex,
      progress: getBandProgress({
        bandIndex,
        bandCount: colors.length,
        coverage: clampedCoverage,
        staggerShare,
      }),
    }))
    .filter((band) => band.progress > 0);

  return (
    <AbsoluteFill aria-hidden className={cn('overflow-hidden', className)}>
      {/* The leading band sits at the bottom of the stack so the lagging
          bands cover its tail and leave it as an edge stripe. */}
      {bands.map((band) => (
        <AbsoluteFill
          key={`block-wipe-band-${band.bandIndex}`}
          style={{
            backgroundColor: band.color,
            clipPath: getWipeClipPathPolygon({
              progress: band.progress,
              directionInDegrees,
              canvasAspect: width / height,
            }),
          }}
        />
      ))}
    </AbsoluteFill>
  );
}
