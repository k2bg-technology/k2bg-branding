import { twMerge } from 'tailwind-merge';

type Props = React.ComponentPropsWithRef<'div'>;

export function Root({ className, children, ...rest }: Props) {
  return (
    <article className="contents">
      <div {...rest} className={twMerge('flex bg-white', className)}>
        {children}
      </div>
    </article>
  );
}

Root.displayName = 'BlogCard';
