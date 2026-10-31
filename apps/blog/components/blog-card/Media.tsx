import { cn } from 'ui';

interface Props extends React.ComponentPropsWithoutRef<'div'> {}

export function Media({ className, children, ...rest }: Props) {
  return (
    <div {...rest} className={cn('overflow-hidden rounded-xl', className)}>
      {children}
    </div>
  );
}
