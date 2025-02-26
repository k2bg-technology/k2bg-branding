import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { twMerge } from 'tailwind-merge';

type Props = React.ComponentPropsWithRef<'img'>;

export default function Image({ className, ...rest }: Props) {
  return <AvatarPrimitive.Image {...rest} className={twMerge(className)} />;
}

Image.displayName = AvatarPrimitive.Image.displayName;
