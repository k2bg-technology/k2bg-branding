'use client';

import { Select as SelectPrimitive } from '@base-ui/react/select';

import { cn } from '../../utils/cn';
import { ScrollArea } from '../ScrollArea';

export function Popup({
  children,
  className,
  ...rest
}: SelectPrimitive.Popup.Props) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={4} alignItemWithTrigger={false}>
        <SelectPrimitive.Popup
          {...rest}
          className={cn(
            'flex max-h-[min(var(--available-height),18rem)] min-w-(--anchor-width) flex-col rounded-md border border-base-default/15 bg-white text-base-black shadow-md outline-hidden',
            className
          )}
        >
          {/* The listbox owns keyboard focus, so its scroller must stay out of the tab order. */}
          <ScrollArea viewportTabIndex={-1}>
            <SelectPrimitive.List className="p-1">
              {children}
            </SelectPrimitive.List>
          </ScrollArea>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  );
}

Popup.displayName = 'Select.Popup';
