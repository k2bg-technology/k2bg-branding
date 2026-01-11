'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from 'ui';
import { create } from 'zustand';

type PageScrollAreaStore = {
  ref: React.RefObject<HTMLDivElement | null> | null;
  setRef: (ref: React.RefObject<HTMLDivElement | null>) => void;
};

export const usePageScrollAreaStore = create<PageScrollAreaStore>((set) => ({
  ref: null,
  setRef: (ref) => set({ ref }),
}));

type Props = React.ComponentProps<typeof ScrollArea>;

export function PageScrollArea(props: Props) {
  const setRef = usePageScrollAreaStore((state) => state.setRef);
  const ref = useRef(null);

  useEffect(() => {
    setRef(ref);
  }, [setRef]);

  return <ScrollArea {...props} ref={ref} className="max-h-dvh" />;
}
