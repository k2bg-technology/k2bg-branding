import { Button } from '../Button';

export interface PaginationItemProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  selected?: boolean;
}

export function Item(props: PaginationItemProps) {
  const { selected, render, children, ...rest } = props;

  return (
    <Button
      {...rest}
      render={render}
      type={render ? undefined : 'button'}
      aria-current={selected ? 'page' : undefined}
      color={selected ? 'main' : 'dark'}
      variant={selected ? 'default' : 'outline'}
    >
      {children}
    </Button>
  );
}
