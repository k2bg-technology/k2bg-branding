import { twMerge } from 'tailwind-merge';

type FabProps = React.ComponentPropsWithRef<'div'>;

export function Fab({ className, children, ...rest }: FabProps) {
  return (
    <div
      {...rest}
      className={twMerge(
        'fixed bottom-6 right-6 z-50 flex flex-row-reverse gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}
