import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { GradientOverlay, MediaFrame } from '../../primitives';

const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8d200"/><stop offset="1" stop-color="#474a4d"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#g)"/><circle cx="540" cy="760" r="220" fill="#f8b500"/></svg>`;
const SAMPLE_IMAGE_SOURCE = `data:image/svg+xml,${encodeURIComponent(sampleSvg)}`;

export function MediaFrameDemo() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.12]);

  return (
    <AbsoluteFill className="bg-base-black">
      <MediaFrame
        src={SAMPLE_IMAGE_SOURCE}
        mediaType="image"
        transform={`scale(${scale})`}
      />
      <GradientOverlay />
    </AbsoluteFill>
  );
}
