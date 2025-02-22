import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Root({ className, children, ...rest }: Props) {
  return (
    <article className="contents">
      <div {...rest} className={twMerge('flex bg-white', className)}>
        {children}
      </div>
    </article>
  );
}
