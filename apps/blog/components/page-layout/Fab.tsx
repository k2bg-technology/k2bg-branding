import { cn } from 'ui';

interface Props extends React.ComponentPropsWithRef<'div'> {}

export function Fab({ className, children, ...rest }: Props) {
  return (
    <div
      {...rest}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex flex-row-reverse gap-4',
        className
      )}
    >
      {children}
    </div>
  );
}
