import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
} from 'remotion';

import { cn } from '../../utils/cn';
import {
  getEchoLayers,
  getPlaybackRate,
  getSmearBlurInPx,
  getSourceFrameOffset,
  getSpeedAtFrame,
  type SpeedKeyframe,
} from './speedRampMotion';

export type { SpeedKeyframe } from './speedRampMotion';

interface Props {
  src: string;
  speedKeyframes: ReadonlyArray<SpeedKeyframe>;
  sourceStartInFrames?: number;
  echoCount?: number;
  className?: string;
}

// Repositioning a per-frame Sequence and trimming to the accumulated source
// frame is Remotion's deterministic recipe for variable playback speed; the
// playbackRate is only a hint that keeps the Studio preview smooth.
function RemappedVideo({
  src,
  sourceFrame,
  speed,
}: {
  src: string;
  sourceFrame: number;
  speed: number;
}) {
  const frame = useCurrentFrame();

  return (
    <Sequence from={frame} layout="none">
      <OffthreadVideo
        src={src}
        muted
        trimBefore={Math.max(0, Math.round(sourceFrame))}
        playbackRate={getPlaybackRate(speed)}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </Sequence>
  );
}

// Variable-speed playback (video only) driven by a piecewise-linear speed
// curve: hold at street pace, ramp into a hyper-speed rush, snap into
// slow motion. Above normal speed, trailing ghost frames layer over the live
// frame to fake the long-exposure smear of a real time-lapse rush.
export function SpeedRamp({
  src,
  speedKeyframes,
  sourceStartInFrames = 0,
  echoCount = 3,
  className,
}: Props) {
  const frame = useCurrentFrame();
  const speed = getSpeedAtFrame({ frame, speedKeyframes });
  const sourceFrame =
    sourceStartInFrames + getSourceFrameOffset({ frame, speedKeyframes });
  const echoLayers = getEchoLayers({ speed, echoCount });
  const smearBlurInPx = getSmearBlurInPx(speed);

  return (
    <AbsoluteFill
      className={cn('overflow-hidden', className)}
      style={{
        filter: smearBlurInPx > 0 ? `blur(${smearBlurInPx}px)` : undefined,
      }}
    >
      <RemappedVideo src={src} sourceFrame={sourceFrame} speed={speed} />
      {echoLayers.map((echoLayer) => (
        <AbsoluteFill
          key={echoLayer.echoIndex}
          style={{ opacity: echoLayer.opacity }}
        >
          <RemappedVideo
            src={src}
            sourceFrame={sourceFrame - echoLayer.sourceOffsetInFrames}
            speed={speed}
          />
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
}
