import { useCurrentFrame } from 'remotion';

import { cn } from '../../utils/cn';
import { getAccentLabelMotion } from './accentLabelMotion';

export const ACCENT_TONE_CLASS_NAMES = {
  main: 'bg-main-default',
  accent: 'bg-accent-default',
} as const;

const LABEL_FONT_SIZE_IN_PX = 32;
const LABEL_LETTER_SPACING = '0.32em';
const BLOCK_PADDING = '0.4em 0.6em';
const UNDERLINE_HEIGHT_IN_PX = 4;
const UNDERLINE_GAP_IN_PX = 14;
const SIDE_BAR_WIDTH_IN_PX = 6;
const SIDE_BAR_GAP_IN_PX = 20;

interface LabelTextProps {
  text: string;
  opacity: number;
  translateXInPx: number;
  className: string;
  padding?: string;
}

function LabelText({
  text,
  opacity,
  translateXInPx,
  className,
  padding,
}: LabelTextProps) {
  return (
    <span
      className={cn('font-original font-medium uppercase', className)}
      style={{
        fontSize: LABEL_FONT_SIZE_IN_PX,
        letterSpacing: LABEL_LETTER_SPACING,
        padding,
        opacity,
        transform: `translateX(${translateXInPx}px)`,
      }}
    >
      {text}
    </span>
  );
}

interface Props {
  text: string;
  variant?: 'block' | 'underline' | 'sideBar';
  tone?: keyof typeof ACCENT_TONE_CLASS_NAMES;
  enterDelayInFrames?: number;
  className?: string;
}

export function AccentLabel({
  text,
  variant = 'block',
  tone = 'accent',
  enterDelayInFrames = 0,
  className,
}: Props) {
  const frame = useCurrentFrame();

  const { barScale, textOpacity, textTranslateXInPx } = getAccentLabelMotion({
    frame,
    enterDelayInFrames,
  });
  const barClassName = ACCENT_TONE_CLASS_NAMES[tone];

  if (variant === 'underline') {
    return (
      <div
        className={cn('inline-flex flex-col items-start', className)}
        style={{ gap: UNDERLINE_GAP_IN_PX }}
      >
        <LabelText
          text={text}
          opacity={textOpacity}
          translateXInPx={textTranslateXInPx}
          className="text-base-white"
        />
        <div
          className={cn('w-full', barClassName)}
          style={{
            height: UNDERLINE_HEIGHT_IN_PX,
            transform: `scaleX(${barScale})`,
            transformOrigin: 'left',
          }}
        />
      </div>
    );
  }

  if (variant === 'sideBar') {
    return (
      <div
        className={cn('inline-flex items-stretch', className)}
        style={{ gap: SIDE_BAR_GAP_IN_PX }}
      >
        <div
          className={cn('shrink-0', barClassName)}
          style={{
            width: SIDE_BAR_WIDTH_IN_PX,
            transform: `scaleY(${barScale})`,
            transformOrigin: 'top',
          }}
        />
        <LabelText
          text={text}
          opacity={textOpacity}
          translateXInPx={textTranslateXInPx}
          className="text-base-white"
        />
      </div>
    );
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn('absolute inset-0', barClassName)}
        style={{
          transform: `scaleX(${barScale})`,
          transformOrigin: 'left',
        }}
      />
      <LabelText
        text={text}
        opacity={textOpacity}
        translateXInPx={textTranslateXInPx}
        className="text-base-black relative block"
        padding={BLOCK_PADDING}
      />
    </div>
  );
}
