'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { asChildToRender } from '../../utils/asChildToRender';

interface Props extends PopoverPrimitive.Trigger.Props {
  // Deprecated. Use the `render` prop. Kept for backward compatibility while
  // consumer call sites migrate; removed once issue #254 closes.
  asChild?: boolean;
}

export function Trigger({ asChild = true, render, children, ...rest }: Props) {
  const renderProps = asChildToRender({ asChild, render, children });

  return (
    <PopoverPrimitive.Trigger {...rest} render={renderProps.render}>
      {renderProps.children}
    </PopoverPrimitive.Trigger>
  );
}
