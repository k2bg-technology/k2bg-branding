'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

export interface Props
  extends React.ComponentProps<typeof PopoverPrimitive.Root> {}

export function Root(props: Props) {
  return <PopoverPrimitive.Root {...props} />;
}
