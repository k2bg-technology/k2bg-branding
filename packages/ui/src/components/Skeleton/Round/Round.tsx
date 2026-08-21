import { twMerge } from '../../../utils/extendTailwindMerge';

type Props = React.PropsWithChildren & React.HTMLAttributes<HTMLDivElement>;

export function Round(props: Props) {
  const { children, className = 'w-8 h-8' } = props;

  return (
    <div
      {...props}
      className={twMerge(
        'relative flex-none bg-gray-300 rounded-full',
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
