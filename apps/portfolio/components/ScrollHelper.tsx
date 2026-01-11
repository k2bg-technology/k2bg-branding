'use client';

import { useLayoutEffect, useState } from 'react';
import { Icon } from 'ui';
import { twMerge } from 'ui/src/utils/extendTailwindMerge';

import { useMatchMedia } from '../hooks/useMatchMedia';

import styles from './ScrollHelper.module.css';

export function ScrollHelper() {
  const [isShow, setIsShow] = useState(false);
  const isDesktopLayout = useMatchMedia('(min-width: 768px)');

  useLayoutEffect(() => {
    setIsShow(true);
  }, []);

  useLayoutEffect(() => {
    const handleScrollEvent = () => window.scrollX > 0 && setIsShow(false);

    if (isDesktopLayout) window.addEventListener('scroll', handleScrollEvent);

    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, [isDesktopLayout]);

  useLayoutEffect(() => {
    const handleWheelEvent = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      window.scroll(window.scrollX + event.deltaY, 0);
    };

    if (isDesktopLayout) window.addEventListener('wheel', handleWheelEvent);

    return () => window.removeEventListener('wheel', handleWheelEvent);
  }, [isDesktopLayout]);

  if (!isDesktopLayout || !isShow) return null;

  return (
    <button
      type="button"
      className="fixed inset-0 bg-black/20"
      onClick={() => setIsShow(false)}
    >
      <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <div
          className={twMerge(
            `inline-flex items-center gap-condensed rounded-sm px-5 py-normal bg-black/50 text-white`,
            styles.ScrollHelp
          )}
        >
          <span className="text-button-r-sm">Scroll</span>
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
