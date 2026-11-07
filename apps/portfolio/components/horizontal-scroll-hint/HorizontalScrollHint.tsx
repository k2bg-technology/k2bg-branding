'use client';

import { useLayoutEffect, useState } from 'react';
import { cn, Icon } from 'ui';

import { useMatchMedia } from '../../hooks/useMatchMedia';
import type { Dictionary } from '../../i18n/dictionaries';

import styles from './HorizontalScrollHint.module.css';

type HorizontalScrollHintDictionary = Dictionary['horizontalScrollHint'];

interface Props {
  dictionary: HorizontalScrollHintDictionary;
}

export function HorizontalScrollHint({ dictionary }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const isDesktopLayout = useMatchMedia('(min-width: 768px)');

  useLayoutEffect(() => {
    setIsVisible(true);
  }, []);

  useLayoutEffect(() => {
    const handleScroll = () => window.scrollX > 0 && setIsVisible(false);

    if (isDesktopLayout) window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDesktopLayout]);

  if (!isDesktopLayout || !isVisible) return null;

  return (
    <button
      type="button"
      className="fixed inset-0 bg-black/20"
      onClick={() => setIsVisible(false)}
    >
      <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <div
          className={cn(
            `inline-flex items-center gap-condensed rounded-sm px-5 py-normal bg-black/50 text-white`,
            styles.ScrollHelp
          )}
        >
          <span className="text-button-r-sm">{dictionary.label}</span>
          <Icon
            name="chevron-double-right"
            color="var(--color-base-white)"
            width={12.5}
            height={12.5}
          />
        </div>
      </div>
    </button>
  );
}
