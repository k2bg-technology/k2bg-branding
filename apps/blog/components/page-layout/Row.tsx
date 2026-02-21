import { twMerge } from 'tailwind-merge';

interface RowProps extends React.ComponentPropsWithRef<'div'> {}

export function Row({ className, style, children, ...rest }: RowProps) {
  return (
    <div
      {...rest}
      className={twMerge('col-span-full grid grid-cols-[subgrid]', className)}
    >
      {children}
    </div>
  );
}
