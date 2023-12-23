'use client';

import { PropsWithChildren } from 'react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

interface Props {
  trigger: React.ReactNode;
}

export default function DropdownMenu({
  children,
  trigger,
}: PropsWithChildren<Props>) {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>

      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          className="grid gap-2 py-3 min-w-[220px] bg-white border-2 border-slate-100 rounded-md p-[5px] shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
          sideOffset={5}
        >
          {children}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}
