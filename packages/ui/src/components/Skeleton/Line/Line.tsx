import { cn } from '../../../utils/cn';

interface Props extends React.ComponentPropsWithoutRef<'div'> {}

export function Line(props: Props) {
  const { className = 'py-0.5' } = props;

  return (
    <div {...props} className={cn('bg-base-light rounded-5', className)} />
  );
}
