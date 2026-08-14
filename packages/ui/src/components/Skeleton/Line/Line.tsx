import { twMerge } from '../../../utils/extendTailwindMerge';

type Props = React.ComponentPropsWithoutRef<'div'>;

export function Line(props: Props) {
  const { className = 'py-0.5' } = props;

  return (
    <div {...props} className={twMerge('bg-gray-200 rounded-5', className)} />
  );
}
