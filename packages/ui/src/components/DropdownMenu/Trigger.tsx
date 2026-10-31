'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

interface Props extends MenuPrimitive.Trigger.Props {}

export function Trigger(props: Props) {
  return <MenuPrimitive.Trigger {...props} />;
}
