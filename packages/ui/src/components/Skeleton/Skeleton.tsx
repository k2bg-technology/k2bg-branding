import { cn } from '../../utils/cn';

interface Props extends React.ComponentPropsWithoutRef<'div'> {}

export function Skeleton(props: Props) {
  const { children, className, ...rest } = props;

  return (
    <div
      {...rest}
      aria-hidden="true"
      className={cn('animate-pulse', className)}
    >
      {children}
    </div>
  );
}
