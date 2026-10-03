import { Avatar } from 'ui';

interface Props {
  name: string;
  avatarUrl: string | null;
}

export function AuthorAvatar({ name, avatarUrl }: Props) {
  return (
    <Avatar>
      <Avatar.Image alt={name} src={avatarUrl ?? undefined} />
      <Avatar.Fallback>{name.charAt(0).toUpperCase()}</Avatar.Fallback>
    </Avatar>
  );
}
