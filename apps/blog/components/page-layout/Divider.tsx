import { cn } from 'ui';

interface Props extends React.ComponentPropsWithRef<'div'> {}

export function Divider({ className, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn('col-span-full border-b-1 border-slate-200', className)}
    />
  );
}
