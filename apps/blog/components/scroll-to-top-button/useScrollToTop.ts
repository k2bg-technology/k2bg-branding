'use client';

import { useScroll } from 'motion/react';
import { useEffect, useState } from 'react';

import { usePageScrollAreaStore } from '../page-scroll-area/PageScrollArea';

const SCROLL_THRESHOLD = 300;

export function useScrollToTop() {
  const ref = usePageScrollAreaStore((state) => state.ref);

  const [isVisible, setIsVisible] = useState(false);
  const { scrollY } = useScroll({ container: ref ?? undefined });

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsVisible(latest > SCROLL_THRESHOLD);
    });

    return () => {
      unsubscribe();
    };
  }, [scrollY]);

  const scrollToTop = () => {
    ref?.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { isVisible, scrollToTop };
}
