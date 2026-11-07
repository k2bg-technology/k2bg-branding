import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';

import { cn } from '../../utils/cn';

interface Props extends AvatarPrimitive.Root.Props {}

export function Root({ className, ...rest }: Props) {
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
