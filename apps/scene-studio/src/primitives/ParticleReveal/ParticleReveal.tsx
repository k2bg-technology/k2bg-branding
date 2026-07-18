import { type ReactNode, useId } from 'react';
import { AbsoluteFill } from 'remotion';

import { clampUnit } from '../../utils/clampUnit';

interface Props {
  coverage: number;
  seed?: number;
  children: ReactNode;
}

// Grain field: two octaves mix fine photographic dust with slightly larger
// specks so the dissolve reads granular, not blocky.
const GRAIN_BASE_FREQUENCY = 0.18;
const GRAIN_OCTAVES = 2;
// Threshold steepness on the noise alpha; higher makes harder grain edges.
const THRESHOLD_SLOPE = 25;

// Dissolves its children into granular dust: a noise-thresholded alpha matte
// (a luminance-matte on procedural noise) keeps a coverage-sized share of the
// pixels. Coverage 1 renders the children untouched, so transitions can cross
// that endpoint invisibly; at 0 nothing remains.
export function ParticleReveal({ coverage, seed = 0, children }: Props) {
  const clampedCoverage = clampUnit(coverage);
  // Instance-unique: SVG ids are document-wide, so seed-derived ids would
  // collide across simultaneously mounted instances.
  const filterId = useId();

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
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={GRAIN_BASE_FREQUENCY}
              numOctaves={GRAIN_OCTAVES}
              seed={seed}
              result="grainField"
            />
            {/* Soft threshold: grains whose noise alpha exceeds
                (1 - coverage) survive, so grain density tracks coverage. */}
            <feComponentTransfer in="grainField" result="grainMatte">
              <feFuncA
                type="linear"
                slope={THRESHOLD_SLOPE}
                intercept={-THRESHOLD_SLOPE * (1 - clampedCoverage)}
              />
            </feComponentTransfer>
            <feComposite in="SourceGraphic" in2="grainMatte" operator="in" />
          </filter>
        </defs>
      </svg>
      <AbsoluteFill
        style={{
          filter: clampedCoverage >= 1 ? undefined : `url(#${filterId})`,
        }}
      >
        {children}
      </AbsoluteFill>
    </>
  );
}
