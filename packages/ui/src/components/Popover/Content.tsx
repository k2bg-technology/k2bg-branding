'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from '../../..';

const variants = cva(
  'rounded-md border p-spacious shadow-md outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  {
    variants: {
      color: {
        light: 'bg-white border-base-default/20 text-base-black',
        dark: 'bg-base-black border-base-black/50 text-white',
      },
    },
    defaultVariants: {
      color: 'light',
    },
  }
);

type Props = React.ComponentPropsWithoutRef<typeof RadixPopover.Content> &
  VariantProps<typeof variants>;

export function Content({
  children,
  className,
  color,
  align = 'center',
  sideOffset = 4,
  ...rest
}: Props) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        className={twMerge(variants({ color }), className)}
        align={align}
        sideOffset={sideOffset}
        {...rest}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  );
}

Content.displayName = RadixPopover.Content.displayName;
