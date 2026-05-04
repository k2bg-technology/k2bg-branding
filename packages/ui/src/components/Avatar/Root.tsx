import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';

import { cn } from '../../utils/cn';

export function Root({ className, ...rest }: AvatarPrimitive.Root.Props) {
  return (
    <AvatarPrimitive.Root
      {...rest}
      className={cn(
        'relative flex h-6 w-6 shrink-0 overflow-hidden rounded-full',
        className
      )}
    />
  );
}
