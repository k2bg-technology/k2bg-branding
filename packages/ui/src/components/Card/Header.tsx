import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

interface Props extends ComponentProps<'div'> {}

export function Header({ className, ...rest }: Props) {
  return (
    <div
      data-slot="card-header"
      {...rest}
      className={cn('flex flex-col gap-1.5 px-6', className)}
    />
  );
}

Header.displayName = 'Card.Header';
