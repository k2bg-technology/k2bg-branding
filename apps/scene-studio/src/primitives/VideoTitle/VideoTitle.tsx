import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

import { springs } from '../../tokens/motion';
import { cn } from '../../utils/cn';

const TONE_CLASS_NAMES = {
  main: 'text-main-default',
  accent: 'text-accent-default',
  white: 'text-base-white',
} as const;

interface Props {
  title: string;
  tone?: keyof typeof TONE_CLASS_NAMES;
  enterDelayInFrames?: number;
  className?: string;
}

export function VideoTitle({
  title,
  tone = 'white',
  enterDelayInFrames = 0,
  className,
}: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame: frame - enterDelayInFrames,
    fps,
    config: springs.gentle,
  });

  return (
    <h1
      className={cn(
        'font-original text-scene-title',
        TONE_CLASS_NAMES[tone],
        className
      )}
      style={{
        opacity: enter,
        transform: `translateY(${(1 - enter) * 60}px)`,
      }}
    >
      {title}
    </h1>
  );
}
