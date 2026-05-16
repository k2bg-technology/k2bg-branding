'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { cn } from '../../utils/cn';

export function Item({ className, ...rest }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      {...rest}
      className={cn(
        'group text-button-r-sm leading-none rounded-[0.3rem] flex items-center px-2 py-2 relative select-none outline-hidden hover:bg-base-black/10 transition-colors duration-200 ease-in-out',
        className
      )}
    />
  );
}
