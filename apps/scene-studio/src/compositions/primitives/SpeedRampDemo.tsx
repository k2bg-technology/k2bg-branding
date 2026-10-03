import { AbsoluteFill, staticFile } from 'remotion';

import { SpeedRamp } from '../../primitives/SpeedRamp';

// A still image cannot show a time remap, so unlike the other demos this one
// plays real footage from the local-only asset library (public/assets is
// gitignored and rendering is local-macOS-only, same as the experiments).
const DEMO_FOOTAGE = 'assets/NewYork/IMG_5521.MOV';

// Street pace, ramp into a 10x rush, then snap into slow motion.
// Source budget: the curve consumes ~493 source frames of the ~964-frame clip.
const SPEED_KEYFRAMES = [
  { atFrame: 0, speed: 1 },
  { atFrame: 50, speed: 1 },
  { atFrame: 80, speed: 10 },
  { atFrame: 105, speed: 10 },
  { atFrame: 107, speed: 0.4 },
] as const;

export function SpeedRampDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <SpeedRamp
        src={staticFile(DEMO_FOOTAGE)}
        speedKeyframes={SPEED_KEYFRAMES}
      />
    </AbsoluteFill>
  );
}
