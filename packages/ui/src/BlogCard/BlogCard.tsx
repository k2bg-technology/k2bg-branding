import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function BlogCard({ className, children, ...rest }: Props) {
  return (
    <article>
      <div {...rest} className={`flex bg-white ${className}`}>
        {children}
      </div>
    </article>
  );
}
