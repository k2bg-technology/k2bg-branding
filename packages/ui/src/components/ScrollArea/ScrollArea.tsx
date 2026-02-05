'use client';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import type * as React from 'react';
import { twMerge } from 'tailwind-merge';

import { ScrollBar } from './ScrollBar/ScrollBar';

interface ScrollAreaProps
  extends React.ComponentPropsWithRef<typeof ScrollAreaPrimitive.Root> {
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
      className={twMerge('flex flex-col relative overflow-hidden', className)}
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
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
