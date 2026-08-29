import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

type Props = ComponentProps<'th'>;

export function Head({ className, ...rest }: Props) {
  return (
    <th
      data-slot="table-head"
      {...rest}
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap',
        className
      )}
    />
  );
}

Head.displayName = 'Table.Head';
