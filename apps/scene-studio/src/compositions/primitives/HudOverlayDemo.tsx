import { AbsoluteFill, Img } from 'remotion';
import { HudOverlay } from '../../primitives/HudOverlay';
import { SAMPLE_IMAGE_SOURCE } from './sampleImage';

export function HudOverlayDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      {/* The photo underlay shows the marks stay legible over live footage. */}
      <Img
        src={SAMPLE_IMAGE_SOURCE}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <HudOverlay />
    </AbsoluteFill>
  );
}
