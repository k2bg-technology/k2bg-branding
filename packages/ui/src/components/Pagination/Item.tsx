import type { Button } from '../Button';
import { Control } from './Control';

export interface PaginationItemProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  selected?: boolean;
}

export function Item(props: PaginationItemProps) {
  const { selected, render, children, ...rest } = props;

  return (
    <Control
      {...rest}
      render={render}
      aria-current={selected ? 'page' : undefined}
      color={selected ? 'main' : 'dark'}
      variant={selected ? 'default' : 'outline'}
    >
      {children}
    </Control>
  );
}
