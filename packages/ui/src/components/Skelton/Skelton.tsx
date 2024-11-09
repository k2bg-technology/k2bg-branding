import React from 'react';

import { twMerge } from '../../utils/extendTailwindMerge';

export type SkeltonProps = React.PropsWithChildren &
  React.HTMLAttributes<HTMLDivElement>;

export default function Skelton(props: SkeltonProps) {
  const { children, className, ...rest } = props;

  return (
    <div
      {...rest}
      role="status"
      className={twMerge('animate-pulse', className)}
    >
      {children}
    </div>
  );
}
