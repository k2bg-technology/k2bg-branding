'use client';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

type Props = RadixDropdownMenu.DropdownMenuItemProps;

export default function DropdownMenuItem({ children, ...rest }: Props) {
  return (
    <RadixDropdownMenu.Item
      {...rest}
      className="group text-button-r-sm leading-none rounded-[0.3rem] flex items-center px-2 py-2 relative select-none outline-none hover:bg-base-black/10 transition-colors duration-200 ease-in-out"
      asChild
    >
      {children}
    </RadixDropdownMenu.Item>
  );
}

DropdownMenuItem.displayName = RadixDropdownMenu.Item.displayName;
