'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

type Props = MenuPrimitive.Positioner.Props;

export function Positioner({
  children,
  align = 'center',
  sideOffset = 5,
  ...rest
}: Props) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner align={align} sideOffset={sideOffset} {...rest}>
        {children}
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  );
}
