'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';

interface Props<Value, Multiple extends boolean | undefined = false>
  extends SelectPrimitive.Root.Props<Value, Multiple> {}

export function Root<Value, Multiple extends boolean | undefined = false>(
  props: Props<Value, Multiple>
) {
  return <SelectPrimitive.Root {...props} />;
}

Root.displayName = 'Select';
