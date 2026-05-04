import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';

import { cn } from '../../utils/cn';

export function Fallback({
  className,
  ...rest
}: AvatarPrimitive.Fallback.Props) {
  return (
    <AvatarPrimitive.Fallback
      {...rest}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-gray-200',
        className
      )}
    />
  );
}
