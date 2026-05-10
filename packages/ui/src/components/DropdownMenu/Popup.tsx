'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { cn } from '../../utils/cn';

type Props = MenuPrimitive.Popup.Props;

export function Popup({ children, className, ...rest }: Props) {
  return (
    <MenuPrimitive.Popup
      {...rest}
      className={cn(
        'grid gap-normal p-normal min-w-56 bg-white border-2 border-slate-100 rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),_0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]',
        className
      )}
    >
      {children}
    </MenuPrimitive.Popup>
  );
}
