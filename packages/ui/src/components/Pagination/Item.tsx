import { Button } from '../Button';

export interface PaginationItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export function Item(props: PaginationItemProps) {
  const { selected, children, ...rest } = props;

  return (
    <Button
      {...rest}
      type="button"
      color={selected ? 'main' : 'dark'}
      variant={selected ? 'default' : 'outline'}
    >
      {children}
    </Button>
  );
}
