import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { springs } from '../../tokens/motion';
import { cn } from '../../utils/cn';

interface Props {
  cta?: string;
  handle?: string;
  className?: string;
}

export function BrandOutro({ cta, handle, className }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: springs.gentle });

  return (
    <AbsoluteFill
      className={cn(
        'items-center justify-center gap-10 bg-base-black',
        className
      )}
      style={{ opacity: enter }}
    >
      <p
        className="font-original font-bold text-base-white"
        style={{
          fontSize: 120,
          transform: `translateY(${(1 - enter) * 40}px)`,
        }}
      >
        K2BG
      </p>
      <div className="h-2 w-60 bg-main-default" />
      {cta === undefined ? null : (
        <p className="font-original text-base-white text-scene-cta">{cta}</p>
      )}
      {handle === undefined ? null : (
        <p
          className="font-original text-base-white text-scene-caption"
          style={{ opacity: 0.7 }}
        >
          {handle}
        </p>
      )}
    </AbsoluteFill>
  );
}
