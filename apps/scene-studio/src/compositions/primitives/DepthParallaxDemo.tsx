import { AbsoluteFill } from 'remotion';
import { DepthParallax } from '../../primitives';
import { SAMPLE_DEPTH_SOURCE, SAMPLE_IMAGE_SOURCE } from './sampleImage';

export function DepthParallaxDemo() {
  return (
    <AbsoluteFill className="bg-base-black">
      {/* The sway and push-in are time-driven, so constant amounts show the
          full orbit across the demo cycle. */}
      <DepthParallax
        src={SAMPLE_IMAGE_SOURCE}
        depthSrc={SAMPLE_DEPTH_SOURCE}
        parallaxAmount={1}
        dollyAmount={0.6}
        focus={0.85}
        blurAmount={0.6}
      />
    </AbsoluteFill>
  );
}
