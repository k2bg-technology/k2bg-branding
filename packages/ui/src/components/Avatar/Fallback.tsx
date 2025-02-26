import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { twMerge } from 'tailwind-merge';

type Props = React.ComponentPropsWithRef<'span'>;

export default function Fallback({ className, ...rest }: Props) {
  return (
    <AvatarPrimitive.Fallback
      {...rest}
      className={twMerge(
        'flex h-full w-full items-center justify-center rounded-full bg-gray-200',
        className
      )}
    />
  );
}

Fallback.displayName = AvatarPrimitive.Fallback.displayName;
