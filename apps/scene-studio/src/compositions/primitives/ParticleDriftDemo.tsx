import { AbsoluteFill } from 'remotion';
import { ParticleDrift } from '../../primitives';

export function ParticleDriftDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <AbsoluteFill className="items-center justify-center">
        <div className="h-1/2 w-1/2 rounded-full bg-main-default opacity-30" />
      </AbsoluteFill>
      <ParticleDrift />
    </AbsoluteFill>
  );
}
