import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { twMerge } from 'tailwind-merge';

type Props = React.ComponentPropsWithRef<'span'>;

export function Root({ className, ...rest }: Props) {
  return (
    <AvatarPrimitive.Root
      {...rest}
      className={twMerge(
        'relative flex h-6 w-6 shrink-0 overflow-hidden rounded-full',
        className
      )}
    />
  );
}

Root.displayName = AvatarPrimitive.Root.displayName;
