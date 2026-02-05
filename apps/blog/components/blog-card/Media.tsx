import { twMerge } from 'tailwind-merge';

type Props = React.ComponentPropsWithoutRef<'div'>;

export function Media({ className, children, ...rest }: Props) {
  return (
    <div {...rest} className={twMerge('overflow-hidden rounded-xl', className)}>
      {children}
    </div>
  );
}
