import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

const BRAND_COLORS = [
  { name: 'main-default', hex: '#b8d200', swatchClassName: 'bg-main-default' },
  {
    name: 'accent-default',
    hex: '#f8b500',
    swatchClassName: 'bg-accent-default',
  },
  { name: 'base-white', hex: '#f3f3f2', swatchClassName: 'bg-base-white' },
  { name: 'base-black', hex: '#474a4d', swatchClassName: 'bg-base-black' },
] as const;

const STAGGER_IN_FRAMES = 8;

export function TokenScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="items-center justify-center gap-14 bg-base-black">
      <h2 className="font-original text-base-white" style={{ fontSize: 56 }}>
        Color Tokens
      </h2>
      {BRAND_COLORS.map((color, index) => {
        const enter = spring({
          frame: frame - index * STAGGER_IN_FRAMES,
          fps,
          config: { damping: 200 },
        });

        return (
          <div
            key={color.name}
            className="flex w-[560px] items-center gap-10"
            style={{
              opacity: enter,
              transform: `translateX(${(1 - enter) * 120}px)`,
            }}
          >
            <div
              className={`h-32 w-32 rounded-2xl border-2 border-base-white ${color.swatchClassName}`}
            />
            <div className="font-original text-base-white">
              <p style={{ fontSize: 36 }}>{color.name}</p>
              <p style={{ fontSize: 30, opacity: 0.6 }}>{color.hex}</p>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
