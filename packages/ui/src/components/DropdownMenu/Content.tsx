'use client';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import { twMerge } from 'tailwind-merge';

type Props = React.ComponentPropsWithoutRef<typeof RadixDropdownMenu.Content>;

export function Content({
  children,
  className,
  sideOffset = 5,
  ...rest
}: Props) {
  return (
    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        className={twMerge(
          'grid gap-normal p-normal min-w-56 bg-white border-2 border-slate-100 rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]',
          className
        )}
        sideOffset={sideOffset}
        {...rest}
      >
        {children}
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  );
}

Content.displayName = RadixDropdownMenu.Content.displayName;
