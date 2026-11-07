'use client';

import { useScroll } from 'motion/react';
import { useEffect, useState } from 'react';

import { usePageScrollAreaStore } from '../page-scroll-area/PageScrollArea';

const SCROLL_THRESHOLD = 300;

export interface ScrollToTopState {
  isVisible: boolean;
  scrollToTop: () => void;
}

export function useScrollToTop(): ScrollToTopState {
  const scrollContainerRef = usePageScrollAreaStore(
    (state) => state.scrollContainerRef
  );

  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll({ container: scrollContainerRef ?? undefined });

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsVisible(latest > SCROLL_THRESHOLD);
    });

    return () => {
      unsubscribe();
    };
  }, [scrollY]);

  const scrollToTop = () => {
    scrollContainerRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { isVisible, scrollToTop };
}
