'use client';

import { Menu as MenuPrimitive } from '@base-ui/react/menu';

import { asChildToRender } from '../../utils/asChildToRender';
import { cn } from '../../utils/cn';

interface Props extends MenuPrimitive.Item.Props {
  // Deprecated. Use the `render` prop. Kept for backward compatibility while
  // consumer call sites migrate; removed once issue #254 closes.
  asChild?: boolean;
}

export function Item({
  asChild = true,
  render,
  children,
  className,
  ...rest
}: Props) {
  const renderProps = asChildToRender({ asChild, render, children });

  return (
    <MenuPrimitive.Item
      {...rest}
      className={cn(
        'group text-button-r-sm leading-none rounded-[0.3rem] flex items-center px-2 py-2 relative select-none outline-hidden hover:bg-base-black/10 transition-colors duration-200 ease-in-out',
        className
      )}
      render={renderProps.render}
    >
      {renderProps.children}
    </MenuPrimitive.Item>
  );
}
