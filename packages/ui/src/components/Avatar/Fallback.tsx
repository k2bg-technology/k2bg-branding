import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';

import { cn } from '../../utils/cn';

interface Props extends AvatarPrimitive.Fallback.Props {}

export function Fallback({ className, ...rest }: Props) {
  return (
    <AvatarPrimitive.Fallback
      {...rest}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-base-light',
        className
      )}
    />
  );
}
