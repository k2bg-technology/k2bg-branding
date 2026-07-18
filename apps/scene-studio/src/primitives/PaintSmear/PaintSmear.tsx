import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';

import { clampUnit } from '../../utils/clampUnit';

interface Props {
  intensity: number;
  seed?: number;
  children: ReactNode;
}

// Pixel shift at intensity 1; large enough to break shapes into brush chunks.
const MAX_DISPLACEMENT_IN_PX = 140;
const TURBULENCE_BASE_FREQUENCY = 0.012;
const TURBULENCE_OCTAVES = 2;

// Warps its children into painterly smears. Intensity 0 renders the children
// untouched, so transitions can cross that endpoint invisibly.
export function PaintSmear({ intensity, seed = 0, children }: Props) {
  const clampedIntensity = clampUnit(intensity);
  const filterId = `paint-smear-${seed}`;

  return (
    <>
      <svg
        aria-hidden
        role="presentation"
        width="0"
        height="0"
        className="absolute"
      >
        <defs>
          {/* The generous filter region keeps displaced pixels from clipping
              at the element bounds. */}
          <filter
            id={filterId}
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency={TURBULENCE_BASE_FREQUENCY}
              numOctaves={TURBULENCE_OCTAVES}
              seed={seed}
              result="brushNoise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="brushNoise"
              scale={clampedIntensity * MAX_DISPLACEMENT_IN_PX}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <AbsoluteFill
        style={{
          filter: clampedIntensity > 0 ? `url(#${filterId})` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
    </>
  );
}
