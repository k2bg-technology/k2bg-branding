import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

type Props = ComponentProps<'tbody'>;

export function Body({ className, ...rest }: Props) {
  return (
    <tbody
      data-slot="table-body"
      {...rest}
      className={cn('[&_tr:last-child]:border-0', className)}
    />
  );
}

Body.displayName = 'Table.Body';
