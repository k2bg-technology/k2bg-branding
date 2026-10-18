import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

type Props = ComponentProps<'div'>;

export function Content({ className, ...rest }: Props) {
  return (
    <div data-slot="card-content" {...rest} className={cn('px-6', className)} />
  );
}

Content.displayName = 'Card.Content';
