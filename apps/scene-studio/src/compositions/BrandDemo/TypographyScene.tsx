import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

const TYPE_SAMPLES = [
  { token: 'advert', sampleClassName: 'text-advert' },
  { token: 'slogan', sampleClassName: 'text-slogan' },
  { token: 'big-header', sampleClassName: 'text-big-header' },
  { token: 'heading-1', sampleClassName: 'text-heading-1' },
  { token: 'body-r-md', sampleClassName: 'text-body-r-md' },
] as const;

const STAGGER_IN_FRAMES = 10;

export function TypographyScene() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill className="justify-center gap-12 bg-base-black px-20">
      <h2 className="font-original text-base-white" style={{ fontSize: 56 }}>
        Typography
      </h2>
      {TYPE_SAMPLES.map((sample, index) => {
        const opacity = interpolate(
          frame - index * STAGGER_IN_FRAMES,
          [0, 20],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div key={sample.token} style={{ opacity }}>
            <p
              className="font-original text-main-default"
              style={{ fontSize: 28 }}
            >
              {sample.token}
            </p>
            <p
              className={`font-original text-base-white ${sample.sampleClassName}`}
            >
              Whereas disregard and contempt for human rights have resulted
            </p>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
