'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import type * as React from 'react';
import { twMerge } from 'tailwind-merge';

import styles from './ScrollBar.module.css';

type ScrollBarProps = React.ComponentPropsWithRef<
  typeof ScrollAreaPrimitive.ScrollAreaScrollbar
>;

export function ScrollBar({
  className,
  orientation = 'vertical',
  ...rest
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      {...rest}
      orientation={orientation}
      className={twMerge(
        'flex touch-none select-none transition-colors',
        orientation === 'vertical' &&
          'h-full w-1.5 md:w-2.5 border-l border-l-transparent p-px',
        orientation === 'horizontal' &&
          'h-1.5 md:h-2.5 flex-col border-t border-t-transparent p-px',
        styles.root,
        className
      )}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-neutral-500/40" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
