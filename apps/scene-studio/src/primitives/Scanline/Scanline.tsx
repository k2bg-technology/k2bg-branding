import { useCurrentFrame, useVideoConfig } from 'remotion';

import { cn } from '../../utils/cn';
import { getScanlineOffsetInPx } from './scanlineMotion';

interface Props {
  opacity?: number;
  spacingInPx?: number;
  driftSpeedInPxPerSecond?: number;
  className?: string;
}

// Classic CRT duty cycle: half line, half gap.
const LINE_SHARE = 0.5;

// Horizontal scanlines over any content, optionally drifting downward. The
// pattern layer is oversized by one period so the drift never exposes a gap.
export function Scanline({
  opacity = 0.15,
  spacingInPx = 6,
  driftSpeedInPxPerSecond = 0,
  className,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const offsetInPx = getScanlineOffsetInPx({
    frame,
    fps,
    driftSpeedInPxPerSecond,
    spacingInPx,
  });
  const lineInPx = spacingInPx * LINE_SHARE;

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className
      )}
      style={{ opacity }}
    >
      <div
        style={{
          position: 'absolute',
          top: -spacingInPx,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundImage: `repeating-linear-gradient(to bottom, rgb(0 0 0) 0px, rgb(0 0 0) ${lineInPx}px, transparent ${lineInPx}px, transparent ${spacingInPx}px)`,
          transform: `translateY(${offsetInPx}px)`,
        }}
      />
    </div>
  );
}
