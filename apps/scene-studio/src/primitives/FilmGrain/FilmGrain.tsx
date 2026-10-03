import { useId } from 'react';
import { useCurrentFrame } from 'remotion';

import { cn } from '../../utils/cn';
import { getGrainShift } from './grainShift';

interface Props {
  opacity?: number;
  seed?: number;
  className?: string;
}

export function FilmGrain({ opacity = 0.07, seed = 7, className }: Props) {
  const frame = useCurrentFrame();
  const filterId = useId();
  const shift = getGrainShift(frame);

  return (
    <svg
      aria-hidden
      role="presentation"
      className={cn('pointer-events-none absolute', className)}
      style={{
        // Oversize the layer so the boil shifts never reveal an edge.
        inset: '-2%',
        width: '104%',
        height: '104%',
        opacity,
        mixBlendMode: 'overlay',
        transform: `translate(${shift.x}px, ${shift.y}px)`,
      }}
    >
      <filter id={filterId}>
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="2"
          seed={seed}
          stitchTiles="stitch"
        />
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`} />
    </svg>
  );
}
