'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

type Props = PopoverPrimitive.Positioner.Props;

export function Positioner({
  children,
  align = 'center',
  sideOffset = 4,
  ...rest
}: Props) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        sideOffset={sideOffset}
        {...rest}
      >
        {children}
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}
