'use client';

import { PropsWithChildren } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

export default function DropdownMenuItem({ children }: PropsWithChildren) {
  return (
    <RadixDropdownMenu.Item
      className="group text-button-sm leading-none rounded-[0.3rem] flex items-center px-[1rem] py-[1rem] relative select-none outline-none hover:bg-base-black/10 transition-colors duration-200 ease-in-out"
      asChild
    >
      {children}
    </RadixDropdownMenu.Item>
  );
}
