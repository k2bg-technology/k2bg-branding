'use client';

import { useWheelToHorizontalScroll } from '../../hooks/useWheelToHorizontalScroll';
import type { Dictionary } from '../../i18n/dictionaries';

import { HorizontalScrollHint } from '../horizontal-scroll-hint/HorizontalScrollHint';

interface Props {
  dictionary: Dictionary['horizontalScrollHint'];
}

// Keeps page-wide wheel handling mounted after the hint is dismissed.
export function HorizontalScroll({ dictionary }: Props) {
  useWheelToHorizontalScroll();

  return <HorizontalScrollHint dictionary={dictionary} />;
}
