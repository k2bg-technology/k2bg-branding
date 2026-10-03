import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

type Props = ComponentProps<'tr'>;

export function Row({ className, ...rest }: Props) {
  return (
    <tr
      data-slot="table-row"
      {...rest}
      className={cn(
        'border-b border-base-default/20 transition-colors hover:bg-base-light/50 data-[state=selected]:bg-base-light',
        className
      )}
    />
  );
}

Row.displayName = 'Table.Row';
