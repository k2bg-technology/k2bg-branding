'use client';

import * as RadixPopover from '@radix-ui/react-popover';

type Props = React.ComponentPropsWithoutRef<typeof RadixPopover.Trigger>;

export function Trigger({ children, ...rest }: Props) {
  return (
    <RadixPopover.Trigger asChild {...rest}>
      {children}
    </RadixPopover.Trigger>
  );
}

Trigger.displayName = RadixPopover.Trigger.displayName;
