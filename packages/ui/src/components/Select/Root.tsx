'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';

export function Root<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>
) {
  return <SelectPrimitive.Root {...props} />;
}

Root.displayName = 'Select';
