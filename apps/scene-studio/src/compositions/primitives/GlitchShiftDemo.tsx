import { AbsoluteFill } from 'remotion';
import { GlitchShift } from '../../primitives';
import { SAMPLE_IMAGE_SOURCE } from './sampleImage';

export function GlitchShiftDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      {/* Full amount: the burst schedule provides the on/off rhythm. */}
      <GlitchShift src={SAMPLE_IMAGE_SOURCE} amount={1} />
    </AbsoluteFill>
  );
}
