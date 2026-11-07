'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from 'ui';
import { create } from 'zustand';

type PageScrollAreaStore = {
  scrollContainerRef: React.RefObject<HTMLDivElement | null> | null;
  setScrollContainerRef: (
    scrollContainerRef: React.RefObject<HTMLDivElement | null>
  ) => void;
};

export const usePageScrollAreaStore = create<PageScrollAreaStore>((set) => ({
  scrollContainerRef: null,
  setScrollContainerRef: (scrollContainerRef) => set({ scrollContainerRef }),
}));

interface Props extends React.ComponentProps<typeof ScrollArea> {}

export function PageScrollArea(props: Props) {
  const setScrollContainerRef = usePageScrollAreaStore(
    (state) => state.setScrollContainerRef
  );
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setScrollContainerRef(scrollContainerRef);
  }, [setScrollContainerRef]);

  return (
    <ScrollArea {...props} ref={scrollContainerRef} className="max-h-dvh" />
  );
}
