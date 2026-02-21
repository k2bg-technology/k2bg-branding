import { twMerge } from 'tailwind-merge';

type DividerProps = React.ComponentPropsWithRef<'div'>;

export function Divider({ className, ...rest }: DividerProps) {
  return (
    <div
      {...rest}
      className={twMerge(
        'col-span-full border-b-1 border-slate-200',
        className
      )}
    />
  );
}
