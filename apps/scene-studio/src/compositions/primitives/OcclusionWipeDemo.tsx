import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import { OcclusionWipe } from '../../primitives/OcclusionWipe';
import { SAMPLE_IMAGE_SOURCE } from './sampleImage';

// Local cycle length keeps the ramp intact when the demo is re-hosted inside
// another composition's sequence.
const EFFECT_CYCLE_IN_FRAMES = 150;
const CUT_FRAME = EFFECT_CYCLE_IN_FRAMES / 2;
const SWEEP_DURATION_IN_FRAMES = 60;

export function OcclusionWipeDemo() {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [
      CUT_FRAME - SWEEP_DURATION_IN_FRAMES / 2,
      CUT_FRAME + SWEEP_DURATION_IN_FRAMES / 2,
    ],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill className="bg-base-black">
      {/* The hue-rotated copy stands in for the next shot; the silhouette
          covers the frame exactly on the cut frame so the swap stays hidden. */}
      <Img
        src={SAMPLE_IMAGE_SOURCE}
        className="absolute inset-0 h-full w-full object-cover"
        style={frame < CUT_FRAME ? undefined : { filter: 'hue-rotate(160deg)' }}
      />
      <OcclusionWipe progress={progress} />
    </AbsoluteFill>
  );
}
