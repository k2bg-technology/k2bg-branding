import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

type Props = ComponentProps<'table'>;

export function Root({ className, ...rest }: Props) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        {...rest}
        className={cn(
          'w-full caption-bottom text-body-r-sm text-base-black',
          className
        )}
      />
    </div>
  );
}

Root.displayName = 'Table';
