import React, { HTMLAttributes } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { twMerge } from 'tailwind-merge';

export interface Props extends HTMLAttributes<HTMLSpanElement> {}

const Fallback = React.forwardRef<HTMLSpanElement, Props>(
  ({ className, ...rest }, ref) => (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={twMerge(
        'flex h-full w-full items-center justify-center rounded-full bg-gray-200',
        className
      )}
      {...rest}
    />
  )
);
Fallback.displayName = 'Fallback';

export default Fallback;
