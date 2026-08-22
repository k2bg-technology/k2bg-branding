import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import { PaintSmear } from '../../primitives';
import { SAMPLE_IMAGE_SOURCE } from './sampleImage';

// Local cycle length keeps the ramp intact when the demo is re-hosted inside
// another composition's sequence.
const EFFECT_CYCLE_IN_FRAMES = 150;

export function PaintSmearDemo() {
  const frame = useCurrentFrame();

  const intensity = interpolate(
    frame,
    [0, EFFECT_CYCLE_IN_FRAMES / 2, EFFECT_CYCLE_IN_FRAMES],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill className="bg-base-black">
      <PaintSmear intensity={intensity}>
        <Img
          src={SAMPLE_IMAGE_SOURCE}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </PaintSmear>
    </AbsoluteFill>
  );
}
