'use client';

import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import type * as React from 'react';

import { cn } from '../../utils/cn';

import { ScrollBar } from './ScrollBar/ScrollBar';

interface ScrollAreaProps extends ScrollAreaPrimitive.Root.Props {
  scrollbar?: React.ReactElement<
    React.ComponentPropsWithoutRef<typeof ScrollBar>
  > | null;
}

export function ScrollArea({
  className,
  children,
  scrollbar,
  ref,
  ...rest
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      {...rest}
      className={cn('flex flex-col relative overflow-hidden', className)}
    >
      <ScrollAreaPrimitive.Viewport
        ref={ref}
        className="flex-grow w-full rounded-[inherit]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {scrollbar || <ScrollBar />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
