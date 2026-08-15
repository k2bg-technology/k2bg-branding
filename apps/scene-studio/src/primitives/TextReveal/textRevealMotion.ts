import { Easing, interpolate } from 'remotion';

const CLAMP_OPTIONS = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

// Grapheme segmentation keeps Japanese characters and surrogate pairs whole.
// A fixed locale keeps the split identical on every rendering machine.
const graphemeSegmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });

interface SplitTextInput {
  text: string;
  splitBy: 'character' | 'word';
}

// Word mode splits on whitespace only, so Japanese text should use 'character'.
export function splitTextIntoUnits({
  text,
  splitBy,
}: SplitTextInput): string[] {
  if (splitBy === 'word') {
    return text.split(/(\s+)/).filter((unit) => unit.length > 0);
  }

  return Array.from(
    graphemeSegmenter.segment(text),
    (segment) => segment.segment
  );
}

const WHITESPACE_ONLY_PATTERN = /^\s+$/;
// CJK graphemes may break anywhere, so each one stays its own run.
const CJK_PATTERN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;

export interface TextUnit {
  unitIndex: number;
  unitText: string;
}

// Groups consecutive non-CJK graphemes into word runs so the component can
// forbid line breaks inside a word while still breaking between words.
export function groupUnitsIntoWrappableRuns(units: string[]): TextUnit[][] {
  const runs: TextUnit[][] = [];

  units.forEach((unitText, unitIndex) => {
    const unit = { unitIndex, unitText };
    const startsOwnRun =
      WHITESPACE_ONLY_PATTERN.test(unitText) || CJK_PATTERN.test(unitText);
    const previousRun = runs[runs.length - 1];
    const previousRunIsJoinableWord =
      previousRun !== undefined &&
      !WHITESPACE_ONLY_PATTERN.test(previousRun[0].unitText) &&
      !CJK_PATTERN.test(previousRun[0].unitText);

    if (startsOwnRun || !previousRunIsJoinableWord) {
      runs.push([unit]);
      return;
    }

    previousRun.push(unit);
  });

  return runs;
}

interface TextUnitMotionInput {
  unitIndex: number;
  frame: number;
  enterDelayInFrames: number;
  staggerInFrames: number;
  unitDurationInFrames: number;
  offsetInPx: number;
  blurInPx: number;
}

export function getTextUnitMotion({
  unitIndex,
  frame,
  enterDelayInFrames,
  staggerInFrames,
  unitDurationInFrames,
  offsetInPx,
  blurInPx,
}: TextUnitMotionInput) {
  const progress = interpolate(
    frame - enterDelayInFrames - unitIndex * staggerInFrames,
    [0, unitDurationInFrames],
    [0, 1],
    { ...CLAMP_OPTIONS, easing: Easing.out(Easing.cubic) }
  );

  return {
    opacity: progress,
    translateYInPx: (1 - progress) * offsetInPx,
    blurInPx: (1 - progress) * blurInPx,
  };
}
