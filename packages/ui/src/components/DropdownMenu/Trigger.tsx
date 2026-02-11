'use client';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

type Props = React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Trigger>;

export function Trigger({ children, ...rest }: Props) {
  return (
    <RadixDropdownMenu.Trigger asChild {...rest}>
      {children}
    </RadixDropdownMenu.Trigger>
  );
}

Trigger.displayName = RadixDropdownMenu.Trigger.displayName;
