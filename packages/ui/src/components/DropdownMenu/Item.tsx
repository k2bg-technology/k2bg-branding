'use client';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { twMerge } from 'tailwind-merge';

type Props = RadixDropdownMenu.DropdownMenuItemProps;

export function Item({ children, className, ...rest }: Props) {
  return (
    <RadixDropdownMenu.Item
      {...rest}
      className={twMerge(
        'group text-button-r-sm leading-none rounded-[0.3rem] flex items-center px-2 py-2 relative select-none outline-hidden hover:bg-base-black/10 transition-colors duration-200 ease-in-out',
        className
      )}
      asChild
    >
      {children}
    </RadixDropdownMenu.Item>
  );
}

Item.displayName = RadixDropdownMenu.Item.displayName;
