'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { asChildToRender } from '../../utils/asChildToRender';

interface Props extends MenuPrimitive.Trigger.Props {
  // Deprecated. Use the `render` prop. Kept for backward compatibility while
  // consumer call sites migrate; removed once issue #254 closes.
  asChild?: boolean;
}

export function Trigger({ asChild = true, render, children, ...rest }: Props) {
  const renderProps = asChildToRender({ asChild, render, children });

  return (
    <MenuPrimitive.Trigger {...rest} render={renderProps.render}>
      {renderProps.children}
    </MenuPrimitive.Trigger>
  );
}
