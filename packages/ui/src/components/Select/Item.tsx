'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';

import { cn } from '../../utils/cn';
import { Icon } from '../Icon';

export function Item({
  children,
  className,
  ...rest
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      {...rest}
      className={cn(
        'grid cursor-default grid-cols-[1fr_1rem] items-center gap-2 rounded-sm px-2 py-1.5 text-body-r-sm outline-hidden select-none data-disabled:opacity-50 data-highlighted:bg-base-black/5',
        className
      )}
    >
      <SelectPrimitive.ItemText className="truncate">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="flex">
        <Icon name="check" width={16} height={16} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

Item.displayName = 'Select.Item';
