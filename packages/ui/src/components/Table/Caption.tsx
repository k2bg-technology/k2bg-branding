import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

type Props = ComponentProps<'caption'>;

export function Caption({ className, ...rest }: Props) {
  return (
    <caption
      data-slot="table-caption"
      {...rest}
      className={cn('mt-spacious text-body-r-sm text-base-black/80', className)}
    />
  );
}

Caption.displayName = 'Table.Caption';
