import { interpolate, useCurrentFrame } from 'remotion';

import { durationsInFrames } from '../../tokens/motion';
import { cn } from '../../utils/cn';

interface Props {
  text: string;
  enterDelayInFrames?: number;
  exitAtFrame?: number;
  className?: string;
}

export function Caption({
  text,
  enterDelayInFrames = 0,
  exitAtFrame,
  className,
}: Props) {
  const frame = useCurrentFrame();

  const enter = interpolate(
    frame - enterDelayInFrames,
    [0, durationsInFrames.enter],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exit =
    exitAtFrame === undefined
      ? 1
      : interpolate(
          frame,
          [exitAtFrame, exitAtFrame + durationsInFrames.fast],
          [1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

  return (
    <p
      className={cn(
        'font-original text-base-white text-scene-caption',
        className
      )}
      style={{
        opacity: Math.min(enter, exit),
        transform: `translateY(${(1 - enter) * 24}px)`,
      }}
    >
      {text}
    </p>
  );
}
