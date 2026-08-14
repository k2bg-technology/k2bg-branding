import { AbsoluteFill, Img, interpolate, useCurrentFrame } from 'remotion';
import { ExposureFlash } from '../../primitives/ExposureFlash';
import { SAMPLE_IMAGE_SOURCE } from './sampleImage';

// Local cycle length keeps the ramp intact when the demo is re-hosted inside
// another composition's sequence.
const EFFECT_CYCLE_IN_FRAMES = 150;
const CUT_FRAME = EFFECT_CYCLE_IN_FRAMES / 2;

export function ExposureFlashDemo() {
  const frame = useCurrentFrame();

  const intensity = interpolate(
    frame,
    [CUT_FRAME - 20, CUT_FRAME, CUT_FRAME + 20],
    [0, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill className="bg-base-black">
      {/* The hue-rotated copy stands in for the next shot; the flash peaks on
          the cut frame so the swap stays hidden. */}
      <Img
        src={SAMPLE_IMAGE_SOURCE}
        className="absolute inset-0 h-full w-full object-cover"
        style={frame < CUT_FRAME ? undefined : { filter: 'hue-rotate(160deg)' }}
      />
      <ExposureFlash intensity={intensity} />
    </AbsoluteFill>
  );
}
