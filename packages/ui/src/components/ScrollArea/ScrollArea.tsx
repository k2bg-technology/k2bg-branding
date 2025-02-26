'use client';

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { twMerge } from 'tailwind-merge';

import styles from './ScrollArea.module.css';

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
        styles.scrollArea,
        className
      )}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-neutral-500/40" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

type ScrollAreaProps = React.ComponentPropsWithRef<
  typeof ScrollAreaPrimitive.Root
>;

export function ScrollArea({ className, children, ...rest }: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      {...rest}
      className={twMerge('flex flex-col relative overflow-hidden', className)}
    >
      <ScrollAreaPrimitive.Viewport className="flex-grow w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
