import { AbsoluteFill } from 'remotion';
import { FilmGrain } from '../../primitives';

export function FilmGrainDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <AbsoluteFill className="items-center justify-center">
        <div className="h-1/2 w-1/2 rounded-full bg-base-white opacity-70" />
      </AbsoluteFill>
      {/* Far above the production default (0.07) so the demo reads at a glance. */}
      <FilmGrain opacity={0.45} />
    </AbsoluteFill>
  );
}
