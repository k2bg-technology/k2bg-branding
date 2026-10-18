'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';
import type React from 'react';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';

interface Props extends Omit<SelectPrimitive.Trigger.Props, 'children'> {
  placeholder?: React.ReactNode;
}

// `neutral-300` (disabled) is a deliberate exception shared with Form.Input:
// no base-* token is a visually reasonable match for this disabled-state gray.
export function Trigger({ className, placeholder, ...rest }: Props) {
  return (
    <SelectPrimitive.Trigger
      {...rest}
      className={cn(
        'flex h-8 items-center justify-between gap-2 rounded-md border border-base-default/30 bg-white px-3 text-body-r-sm text-base-black shadow-xs outline-hidden select-none focus-visible:ring-[3px] focus-visible:ring-base-default/30 data-disabled:cursor-not-allowed data-disabled:border-neutral-300 data-disabled:text-neutral-300',
        className
      )}
    >
      <SelectPrimitive.Value
        placeholder={placeholder}
        className="truncate data-placeholder:text-base-black/80"
      />
      <SelectPrimitive.Icon className="flex shrink-0">
        <Icon
          name="chevron-down"
          width={16}
          height={16}
          color="var(--color-base-default)"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

Trigger.displayName = 'Select.Trigger';
