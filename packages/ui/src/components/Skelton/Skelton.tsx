import { twMerge } from '../../utils/extendTailwindMerge';

type Props = React.ComponentPropsWithoutRef<'div'>;

export default function Skelton(props: Props) {
  const { children, className, ...rest } = props;

  return (
    <div {...rest} className={twMerge('animate-pulse', className)}>
      {children}
    </div>
  );
}
