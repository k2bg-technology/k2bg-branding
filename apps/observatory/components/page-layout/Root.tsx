import type { ComponentPropsWithRef } from 'react';
import { cn } from 'ui';

interface Props extends ComponentPropsWithRef<'main'> {}

export function Root({ className, children, ...rest }: Props) {
  return (
    <main
      {...rest}
      className={cn(
        'mx-auto grid w-full max-w-7xl grid-cols-4 content-start gap-4 p-4 text-base-black md:grid-cols-6 md:gap-6 xl:grid-cols-12 xl:gap-8 xl:p-8',
        className
      )}
    >
      {children}
    </main>
  );
}
