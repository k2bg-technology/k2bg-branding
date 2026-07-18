import { AbsoluteFill } from 'remotion';
import { Scanline } from '../../primitives';

export function ScanlineDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      <AbsoluteFill className="items-center justify-center">
        <div className="h-1/2 w-1/2 rounded-full bg-base-white opacity-70" />
      </AbsoluteFill>
      {/* Far above a production-subtle setting so the lines read at a glance. */}
      <Scanline opacity={0.4} spacingInPx={8} driftSpeedInPxPerSecond={12} />
    </AbsoluteFill>
  );
}
