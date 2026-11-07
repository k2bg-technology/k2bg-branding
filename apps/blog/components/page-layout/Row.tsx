import { cn } from 'ui';

interface Props extends React.ComponentPropsWithRef<'div'> {}

export function Row({ className, style, children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn('col-span-full grid grid-cols-[subgrid]', className)}
    >
      {children}
    </div>
  );
}
