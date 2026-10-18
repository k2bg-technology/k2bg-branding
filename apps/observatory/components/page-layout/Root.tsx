import type { ComponentPropsWithRef } from 'react';
import { cn } from 'ui';

export function Root({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<'main'>) {
  return (
    <main
      {...rest}
      className={cn(
        'grid grid-cols-4 content-start gap-4 p-4 text-base-black md:grid-cols-6 md:gap-6 xl:grid-cols-12 xl:gap-8 xl:p-8',
        className
      )}
    >
      {children}
    </main>
  );
}
