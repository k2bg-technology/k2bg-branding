import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

interface Props extends ComponentProps<'div'> {}

export function Root({ className, ...rest }: Props) {
  return (
    <div
      data-slot="card"
      {...rest}
      className={cn(
        'flex flex-col gap-6 rounded-xl border border-base-default/15 bg-white py-6 text-base-black shadow-xs',
        className
      )}
    />
  );
}

Root.displayName = 'Card';
