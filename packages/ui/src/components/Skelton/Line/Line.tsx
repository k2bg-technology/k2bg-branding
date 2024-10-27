import { twMerge } from '../../../utils/extendTailwindMerge';

export type LineProps = React.HTMLAttributes<HTMLDivElement>;

export function Line(props: LineProps) {
  const { className = 'py-0.5' } = props;

  return (
    <div {...props} className={twMerge('bg-gray-200 rounded-5', className)} />
  );
}
