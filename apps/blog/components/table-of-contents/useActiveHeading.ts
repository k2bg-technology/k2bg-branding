'use client';

import { useScroll } from 'motion/react';
import { useEffect, useState } from 'react';

import { usePageScrollAreaStore } from '../page-scroll-area/PageScrollArea';

const OFFSET_THRESHOLD = 100;

export function useActiveHeading(headingIds: string[]) {
  const ref = usePageScrollAreaStore((state) => state.ref);
  const [activeId, setActiveId] = useState('');
  const { scrollY } = useScroll({ container: ref ?? undefined });

  useEffect(() => {
    if (headingIds.length === 0) return;

    const unsubscribe = scrollY.on('change', () => {
      const container = ref?.current;
      if (!container) return;

      const containerTop = container.getBoundingClientRect().top;

      const currentId = headingIds.reduce((acc, id) => {
        const element = document.getElementById(id);
        if (!element) return acc;

        const elementTop = element.getBoundingClientRect().top - containerTop;
        return elementTop <= OFFSET_THRESHOLD ? id : acc;
      }, '');

      setActiveId(currentId);
    });

    return () => {
      unsubscribe();
    };
  }, [scrollY, headingIds, ref]);

  return activeId;
}
