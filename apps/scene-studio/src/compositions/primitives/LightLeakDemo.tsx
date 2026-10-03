import { AbsoluteFill } from 'remotion';
import { LightLeak } from '../../primitives';

export function LightLeakDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <AbsoluteFill className="items-center justify-center">
        <div className="h-1/2 w-1/2 rounded-3xl bg-base-white opacity-20" />
      </AbsoluteFill>
      <LightLeak />
    </AbsoluteFill>
  );
}
