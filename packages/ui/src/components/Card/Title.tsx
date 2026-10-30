import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

interface Props extends ComponentProps<'div'> {}

export function Title({ className, ...rest }: Props) {
  return (
    <div
      data-slot="card-title"
      {...rest}
      className={cn('text-heading-5 font-semibold leading-none', className)}
    />
  );
}

Title.displayName = 'Card.Title';
