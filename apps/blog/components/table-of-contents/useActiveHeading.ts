'use client';

import { useScroll } from 'motion/react';
import { useEffect, useState } from 'react';

import { usePageScrollAreaStore } from '../page-scroll-area/PageScrollArea';
import type { TocHeading } from './extractHeadings';

const OFFSET_THRESHOLD = 100;

export function useActiveHeading(headings: TocHeading[]): string {
  const ref = usePageScrollAreaStore((state) => state.ref);
  const [activeId, setActiveId] = useState('');
  const { scrollY } = useScroll({ container: ref ?? undefined });

  useEffect(() => {
    if (headings.length === 0) return;

    const unsubscribe = scrollY.on('change', () => {
      const container = ref?.current;
      if (!container) return;

      const containerTop = container.getBoundingClientRect().top;

      const currentId = headings.reduce((activeHeadingId, { id }) => {
        const element = document.getElementById(id);
        if (!element) return activeHeadingId;

        const elementTop = element.getBoundingClientRect().top - containerTop;
        return elementTop <= OFFSET_THRESHOLD ? id : activeHeadingId;
      }, '');

      setActiveId(currentId);
    });

    return () => {
      unsubscribe();
    };
  }, [scrollY, headings, ref]);

  return activeId;
}
