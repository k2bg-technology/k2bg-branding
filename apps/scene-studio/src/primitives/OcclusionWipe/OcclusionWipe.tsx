import { AbsoluteFill, useVideoConfig } from 'remotion';

import { clampUnit } from '../../utils/clampUnit';
import { cn } from '../../utils/cn';
import {
  EDGE_SOFTNESS_IN_PX,
  getOcclusionOffset,
  getSilhouetteRotationInDegrees,
  getSilhouetteShape,
} from './occlusionMotion';

type OcclusionTone = 'dark' | 'bright';

// Fully opaque like a real defocused foreground object, so the cut underneath
// never ghosts through at full coverage.
const TONE_COLORS: Record<OcclusionTone, string> = {
  dark: 'rgb(10, 10, 12)',
  bright: 'rgb(250, 246, 238)',
};

interface Props {
  progress: number;
  directionInDegrees?: number;
  tone?: OcclusionTone;
  seed?: number;
  className?: string;
}

// A defocused foreground silhouette (an out-of-focus passerby or vehicle)
// sweeping across the frame to mask a cut: progress 0 and 1 render nothing
// and mid-sweep covers the frame completely, so both endpoints are invisible
// mount/unmount boundaries for transitions.
export function OcclusionWipe({
  progress,
  directionInDegrees = 0,
  tone = 'dark',
  seed = 0,
  className,
}: Props) {
  const { width, height } = useVideoConfig();

  const clampedProgress = clampUnit(progress);
  if (clampedProgress <= 0 || clampedProgress >= 1) {
    return null;
  }

  const shape = getSilhouetteShape({ seed });
  const offset = getOcclusionOffset({
    progress: clampedProgress,
    directionInDegrees,
    widthInPx: width,
    heightInPx: height,
  });
  const rotationInDegrees = getSilhouetteRotationInDegrees({
    progress: clampedProgress,
    seed,
  });

  return (
    <AbsoluteFill aria-hidden className={cn('overflow-hidden', className)}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: `${shape.widthInPercent}%`,
          height: `${shape.heightInPercent}%`,
          borderRadius: shape.borderRadius,
          backgroundColor: TONE_COLORS[tone],
          filter: `blur(${EDGE_SOFTNESS_IN_PX}px)`,
          transform: `translate(-50%, -50%) translate(${offset.xInPx}px, ${offset.yInPx}px) rotate(${rotationInDegrees}deg)`,
        }}
      />
    </AbsoluteFill>
  );
}
