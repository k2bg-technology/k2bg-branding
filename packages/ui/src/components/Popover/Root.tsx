'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

type Props = React.ComponentProps<typeof PopoverPrimitive.Root>;

export function Root(props: Props) {
  return <PopoverPrimitive.Root {...props} />;
}
