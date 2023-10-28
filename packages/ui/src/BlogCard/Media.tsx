import { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export default function Media({ className, children, ...rest }: Props) {
  return (
    <div {...rest} className={`overflow-hidden rounded-xl w-full ${className}`}>
      {children}
    </div>
  );
}
