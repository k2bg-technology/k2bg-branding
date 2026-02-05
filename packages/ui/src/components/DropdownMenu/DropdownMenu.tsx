'use client';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

type Props = React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Root> & {
  trigger: React.ReactNode;
};

export function DropdownMenu({ children, trigger, ...rest }: Props) {
  return (
    <RadixDropdownMenu.Root {...rest}>
      <RadixDropdownMenu.Trigger asChild>{trigger}</RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          className="grid gap-normal p-normal min-w-56 bg-white border-2 border-slate-100 rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]"
          sideOffset={5}
        >
          {children}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
}

DropdownMenu.displayName = RadixDropdownMenu.Root.displayName;
