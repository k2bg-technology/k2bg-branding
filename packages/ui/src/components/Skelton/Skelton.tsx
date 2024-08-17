import React from 'react';

export type SkeltonProps = React.PropsWithChildren &
  React.HTMLAttributes<HTMLDivElement>;

export default function Skelton(props: SkeltonProps) {
  const { children, className, ...rest } = props;

  return (
    <div {...rest} role="status" className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
}
