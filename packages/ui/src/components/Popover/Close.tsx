'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

interface Props extends PopoverPrimitive.Close.Props {}

export function Close(props: Props) {
  return <PopoverPrimitive.Close {...props} />;
}
