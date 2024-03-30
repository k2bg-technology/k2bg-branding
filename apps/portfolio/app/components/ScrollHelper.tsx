'use client';

import { useLayoutEffect, useState } from 'react';
import { SvgIcon } from 'ui';

import { useMatchMedia } from '../hooks/useMatchMedia';

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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div className="fixed inset-0 bg-black/20" onClick={() => setIsShow(false)}>
      <div className="fixed left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <div className="inline-flex items-center gap-2 rounded px-8 py-3 bg-black/50 text-white animate-scrollHelp">
          <span className="text-button-r-sm">Scroll</span>
          <SvgIcon name="chevron-double-right" className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
