'use client';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';

import { asChildToRender } from '../../utils/asChildToRender';

interface Props extends PopoverPrimitive.Close.Props {
  // Deprecated. Use the `render` prop. Kept for backward compatibility while
  // consumer call sites migrate; removed once issue #254 closes.
  asChild?: boolean;
}

export function Close({ asChild = true, render, children, ...rest }: Props) {
  const renderProps = asChildToRender({ asChild, render, children });

  return (
    <PopoverPrimitive.Close {...rest} render={renderProps.render}>
      {renderProps.children}
    </PopoverPrimitive.Close>
  );
}
