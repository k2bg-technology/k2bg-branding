import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

export function TitleScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200 } });
  const underlineProgress = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="items-center justify-center gap-10 bg-base-black">
      <h1
        className="font-original font-bold text-base-white"
        style={{
          fontSize: 160,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 80}px)`,
        }}
      >
        k2gb
      </h1>
      <div
        className="h-3 bg-main-default"
        style={{ width: underlineProgress * 480 }}
      />
      <p
        className="font-original text-base-white"
        style={{ fontSize: 40, opacity: underlineProgress }}
      >
        scene-studio
      </p>
    </AbsoluteFill>
  );
}
