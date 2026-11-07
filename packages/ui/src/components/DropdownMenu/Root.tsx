'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

export interface Props
  extends React.ComponentProps<typeof MenuPrimitive.Root> {}

export function Root(props: Props) {
  return <MenuPrimitive.Root {...props} />;
}
