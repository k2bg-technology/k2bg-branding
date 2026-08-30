import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

type Props = ComponentProps<'thead'>;

export function Header({ className, ...rest }: Props) {
  return (
    <thead
      data-slot="table-header"
      {...rest}
      className={cn('[&_tr]:border-b', className)}
    />
  );
}

Header.displayName = 'Table.Header';
