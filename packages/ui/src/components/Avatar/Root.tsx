import React, { HTMLAttributes } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { twMerge } from 'tailwind-merge';

export interface Props extends HTMLAttributes<HTMLSpanElement> {}

const Root = React.forwardRef<HTMLSpanElement, Props>(
  ({ className, ...rest }, ref) => (
    <AvatarPrimitive.Root
      ref={ref}
      className={twMerge(
        'relative flex h-6 w-6 shrink-0 overflow-hidden rounded-full',
        className
      )}
      {...rest}
    />
  )
);

Root.displayName = 'Root';

export default Root;
