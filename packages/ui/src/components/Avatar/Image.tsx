import React, { ImgHTMLAttributes } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { twMerge } from 'tailwind-merge';

export interface Props extends ImgHTMLAttributes<HTMLImageElement> {}

const Image = React.forwardRef<HTMLImageElement, Props>(
  ({ className, ...rest }, ref) => (
    <AvatarPrimitive.Image
      ref={ref}
      className={twMerge('aspect-square h-full w-full', className)}
      {...rest}
    />
  )
);
Image.displayName = 'Image';

export default Image;
