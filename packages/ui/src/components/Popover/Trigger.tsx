'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

interface Props extends PopoverPrimitive.Trigger.Props {}

export function Trigger(props: Props) {
  return <PopoverPrimitive.Trigger {...props} />;
}
