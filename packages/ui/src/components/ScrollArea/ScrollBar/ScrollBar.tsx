'use client';

import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';

import { cn } from '../../../utils/cn';

import styles from './ScrollBar.module.css';

type ScrollBarProps = ScrollAreaPrimitive.Scrollbar.Props;

export function ScrollBar({
  className,
  orientation = 'vertical',
  ...rest
}: ScrollBarProps) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      {...rest}
      orientation={orientation}
      className={cn(
        'flex touch-none select-none transition-colors',
        orientation === 'vertical' &&
          'h-full w-1.5 md:w-2.5 border-l border-l-transparent p-px',
        orientation === 'horizontal' &&
          'h-1.5 md:h-2.5 flex-col border-t border-t-transparent p-px',
        styles.root,
        className
      )}
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-base-default/40" />
    </ScrollAreaPrimitive.Scrollbar>
  );
}
