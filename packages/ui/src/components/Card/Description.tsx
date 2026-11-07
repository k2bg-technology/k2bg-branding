import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

interface Props extends ComponentProps<'div'> {}

export function Description({ className, ...rest }: Props) {
  return (
    <div
      data-slot="card-description"
      {...rest}
      className={cn('text-body-r-sm text-base-black/80', className)}
    />
  );
}

Description.displayName = 'Card.Description';
