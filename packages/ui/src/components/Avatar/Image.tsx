import { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';

interface Props extends AvatarPrimitive.Image.Props {}

export function Image(props: Props) {
  return <AvatarPrimitive.Image {...props} />;
}
