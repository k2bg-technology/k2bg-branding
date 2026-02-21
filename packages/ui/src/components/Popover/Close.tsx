'use client';

import * as RadixPopover from '@radix-ui/react-popover';

type Props = React.ComponentPropsWithoutRef<typeof RadixPopover.Close>;

export function Close({ children, ...rest }: Props) {
  return (
    <RadixPopover.Close asChild {...rest}>
      {children}
    </RadixPopover.Close>
  );
}

Close.displayName = RadixPopover.Close.displayName;
