import { useLayoutEffect } from 'react';

import { useMatchMedia } from './useMatchMedia';

export function useWheelToHorizontalScroll(): void {
  const isDesktopLayout = useMatchMedia('(min-width: 768px)');

  useLayoutEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;
      window.scroll(window.scrollX + event.deltaY, 0);
    };

    if (isDesktopLayout) window.addEventListener('wheel', handleWheel);

    return () => window.removeEventListener('wheel', handleWheel);
  }, [isDesktopLayout]);
}
