import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { DirectionalBlur } from '../../primitives/DirectionalBlur';
import { SAMPLE_IMAGE_SOURCE } from './sampleImage';

// Local cycle length keeps the ramp intact when the demo is re-hosted inside
// another composition's sequence.
const EFFECT_CYCLE_IN_FRAMES = 150;

export function DirectionalBlurDemo() {
  const frame = useCurrentFrame();

  const amount = interpolate(
    frame,
    [0, EFFECT_CYCLE_IN_FRAMES / 2, EFFECT_CYCLE_IN_FRAMES],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill className="bg-base-black">
      <DirectionalBlur
        src={SAMPLE_IMAGE_SOURCE}
        amount={amount}
        angleInDegrees={20}
      />
    </AbsoluteFill>
  );
}
