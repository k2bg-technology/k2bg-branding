import type { ComponentPropsWithRef } from 'react';
import { cn } from 'ui';

export function Content({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<'div'>) {
  return (
    <div {...rest} className={cn('col-span-full', className)}>
      {children}
    </div>
  );
}
