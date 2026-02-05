import { twMerge } from '../../utils/extendTailwindMerge';

type Props = React.ComponentPropsWithoutRef<'div'>;

export function Skelton(props: Props) {
  const { children, className, ...rest } = props;

  return (
    <div
      {...rest}
      aria-hidden="true"
      className={twMerge('animate-pulse', className)}
    >
      {children}
    </div>
  );
}
