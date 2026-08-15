import { useCurrentFrame } from 'remotion';

import { cn } from '../../utils/cn';
import {
  getTextUnitMotion,
  groupUnitsIntoWrappableRuns,
  splitTextIntoUnits,
} from './textRevealMotion';

// Below this the blur is invisible, and a filter that stays on keeps the glyph
// on its own composited layer where it renders softer than plain text.
const SETTLED_BLUR_THRESHOLD_IN_PX = 0.05;

interface Props {
  text: string;
  splitBy?: 'character' | 'word';
  enterDelayInFrames?: number;
  staggerInFrames?: number;
  unitDurationInFrames?: number;
  offsetInPx?: number;
  blurInPx?: number;
  className?: string;
}

export function TextReveal({
  text,
  splitBy = 'character',
  enterDelayInFrames = 0,
  staggerInFrames = 3,
  unitDurationInFrames = 12,
  offsetInPx = 40,
  blurInPx = 8,
  className,
}: Props) {
  const frame = useCurrentFrame();

  const runs = groupUnitsIntoWrappableRuns(
    splitTextIntoUnits({ text, splitBy })
  );

  const renderUnit = ({
    unitIndex,
    unitText,
  }: {
    unitIndex: number;
    unitText: string;
  }) => {
    const motion = getTextUnitMotion({
      unitIndex,
      frame,
      enterDelayInFrames,
      staggerInFrames,
      unitDurationInFrames,
      offsetInPx,
      blurInPx,
    });

    return (
      <span
        key={`unit-${unitIndex}`}
        style={{
          display: 'inline-block',
          whiteSpace: 'pre',
          opacity: motion.opacity,
          transform: `translateY(${motion.translateYInPx}px)`,
          filter:
            motion.blurInPx > SETTLED_BLUR_THRESHOLD_IN_PX
              ? `blur(${motion.blurInPx}px)`
              : undefined,
        }}
      >
        {unitText}
      </span>
    );
  };

  return (
    <p
      className={cn('font-original text-base-white', className)}
      style={{ whiteSpace: 'pre-wrap' }}
    >
      {runs.map((run) =>
        run.length === 1 ? (
          renderUnit(run[0])
        ) : (
          <span
            key={`run-${run[0].unitIndex}`}
            style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
          >
            {run.map(renderUnit)}
          </span>
        )
      )}
    </p>
  );
}
