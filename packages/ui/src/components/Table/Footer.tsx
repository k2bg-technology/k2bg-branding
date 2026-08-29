import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

type Props = ComponentProps<'tfoot'>;

export function Footer({ className, ...rest }: Props) {
  return (
    <tfoot
      data-slot="table-footer"
      {...rest}
      className={cn(
        'border-t border-base-default/20 bg-base-light/50 font-medium [&>tr]:last:border-b-0',
        className
      )}
    />
  );
}

Footer.displayName = 'Table.Footer';
