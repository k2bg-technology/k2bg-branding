import { useCurrentFrame } from 'remotion';

import { cn } from '../../utils/cn';
import { getCaptionMotion } from './captionMotion';

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

  const { opacity, translateYInPx } = getCaptionMotion({
    frame,
    enterDelayInFrames,
    exitAtFrame,
  });

  return (
    <p
      className={cn(
        'font-original text-base-white text-scene-caption',
        className
      )}
      style={{
        opacity,
        transform: `translateY(${translateYInPx}px)`,
      }}
    >
      {text}
    </p>
  );
}
