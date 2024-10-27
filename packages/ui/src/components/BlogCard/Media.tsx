import { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Media({ className, children, ...rest }: Props) {
  return (
    <div {...rest} className={twMerge('overflow-hidden rounded-xl', className)}>
      {children}
    </div>
  );
}
