import type { Button } from '../Button';
import { Control } from './Control';

interface Props extends React.ComponentPropsWithoutRef<typeof Button> {
  selected?: boolean;
}

export function Item(props: Props) {
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

export type { Props as PaginationItemProps };
