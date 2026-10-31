'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';

import { cn } from '../../utils/cn';

interface Props extends SelectPrimitive.Label.Props {}

export function Label({ className, ...rest }: Props) {
  return (
    <SelectPrimitive.Label
      {...rest}
      className={cn('text-body-b-sm font-bold text-base-black', className)}
    />
  );
}

Label.displayName = 'Select.Label';
