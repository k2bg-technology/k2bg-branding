'use client';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

type Props = React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Root>;

export function Root({ children, ...rest }: Props) {
  return <RadixDropdownMenu.Root {...rest}>{children}</RadixDropdownMenu.Root>;
}

Root.displayName = RadixDropdownMenu.Root.displayName;
