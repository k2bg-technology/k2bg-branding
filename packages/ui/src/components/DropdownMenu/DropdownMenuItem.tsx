'use client';

import { PropsWithChildren } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

export default function DropdownMenuItem({ children }: PropsWithChildren) {
  return (
    <RadixDropdownMenu.Item
      className="group text-button-r-sm leading-none rounded-[0.3rem] flex items-center px-2 py-2 relative select-none outline-none hover:bg-base-black/10 transition-colors duration-200 ease-in-out"
      asChild
    >
      {children}
    </RadixDropdownMenu.Item>
  );
}
