import { twMerge } from '../../../utils/extendTailwindMerge';

type LineProps = React.ComponentPropsWithoutRef<'div'>;

export function Box(props: LineProps) {
  const { children, className = 'py-24' } = props;

  return (
    <div
      {...props}
      className={twMerge(
        'relative flex justify-center align-middle bg-gray-300 rounded',
        className
      )}
    >
      {children && (
        <div className="flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          {children}
        </div>
      )}
    </div>
  );
}
