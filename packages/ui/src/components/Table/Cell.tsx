import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

interface Props extends ComponentProps<'td'> {}

export function Cell({ className, ...rest }: Props) {
  return (
    <td
      data-slot="table-cell"
      {...rest}
      className={cn('p-2 align-middle whitespace-nowrap', className)}
    />
  );
}

Cell.displayName = 'Table.Cell';
