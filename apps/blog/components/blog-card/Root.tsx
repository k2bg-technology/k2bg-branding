import { cn } from 'ui';

interface Props extends React.ComponentPropsWithRef<'div'> {}

export function Root({ className, children, ...rest }: Props) {
  return (
    <article className="contents">
      <div {...rest} className={cn('flex bg-white', className)}>
        {children}
      </div>
    </article>
  );
}

Root.displayName = 'BlogCard';
