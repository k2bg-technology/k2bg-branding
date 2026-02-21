'use client';

import * as RadixPopover from '@radix-ui/react-popover';

type Props = React.ComponentPropsWithoutRef<typeof RadixPopover.Root>;

export function Root({ children, ...rest }: Props) {
  return <RadixPopover.Root {...rest}>{children}</RadixPopover.Root>;
}

Root.displayName = RadixPopover.Root.displayName;
