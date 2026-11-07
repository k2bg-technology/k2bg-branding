import type { ComponentPropsWithRef } from 'react';
import { cn } from 'ui';

interface Props extends ComponentPropsWithRef<'div'> {}

export function Content({ className, children, ...rest }: Props) {
  return (
    <div {...rest} className={cn('col-span-full', className)}>
      {children}
    </div>
  );
}
