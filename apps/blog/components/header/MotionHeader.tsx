'use client';

import { motion, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';

import { usePageScrollAreaStore } from '../page-scroll-area/PageScrollArea';

type Props = React.ComponentPropsWithoutRef<'header'>;

export function MotionHeader(props: Props) {
  const { children } = props;

  const ref = usePageScrollAreaStore((state) => state.ref);

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll({ container: ref ?? undefined });

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = scrollY.get();
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    const unsubscribe = scrollY.on('change', handleScroll);

    return () => {
      unsubscribe();
    };
  }, [scrollY, lastScrollY]);

  return (
    <motion.header
      className="order-first sticky top-0 backdrop-blur-xs col-span-full grid grid-cols-[subgrid] bg-base-white/50 drop-shadow-xs"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : '-100%' }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.header>
  );
}
