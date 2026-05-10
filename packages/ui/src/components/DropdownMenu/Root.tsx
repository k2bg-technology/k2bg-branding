'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

type Props = React.ComponentProps<typeof MenuPrimitive.Root>;

export function Root(props: Props) {
  return <MenuPrimitive.Root {...props} />;
}
