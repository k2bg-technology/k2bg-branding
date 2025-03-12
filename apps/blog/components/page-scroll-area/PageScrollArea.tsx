'use client';

import { create } from 'zustand';
import { ScrollArea } from 'ui';
import { useEffect, useRef } from 'react';

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
  }, [ref, setRef]);

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <ScrollArea {...props} ref={ref} className="max-h-dvh" />;
}
