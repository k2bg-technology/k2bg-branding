'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Button, Icon } from 'ui';

import { useScrollToTop } from './useScrollToTop';

export function ScrollToTopButton() {
  const { isVisible, scrollToTop } = useScrollToTop();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            size="icon"
            color="dark"
            onClick={scrollToTop}
            aria-label="ページの先頭へ戻る"
          >
            <Icon name="chevron-up" color="var(--color-white)" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
