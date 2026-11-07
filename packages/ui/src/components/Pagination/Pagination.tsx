import type { Button } from '../Button';
import { Icon } from '../Icon';
import { Control } from './Control';
import { getPaginationItems } from './getPaginationItems';
import { Item } from './Item';

type PrevNextButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

interface Props extends React.ComponentPropsWithoutRef<'nav'> {
  count: number;
  currentPage: number;
  prevProps: PrevNextButtonProps;
  nextProps: PrevNextButtonProps;
  renderItem: (page: number) => React.ReactNode;
}

export function Pagination(props: Props) {
  const { count, currentPage, prevProps, nextProps, renderItem, ...rest } =
    props;

  const itemList = getPaginationItems({ count, currentPage });

  return (
    <nav {...rest} className="flex gap-normal">
      <Control
        aria-label="Previous page"
        {...prevProps}
        color="inherit"
        size="icon"
        disabled={currentPage === 1}
      >
        <Icon name="chevron-left" width={20} height={20} />
      </Control>
      <ul className="flex gap-4">
        {itemList.map((item) => (
          <li key={item} className=" flex items-center">
            {typeof item === 'number' ? (
              renderItem(item)
            ) : (
              <Item disabled>&hellip;</Item>
            )}
          </li>
        ))}
      </ul>
      <Control
        aria-label="Next page"
        {...nextProps}
        color="inherit"
        size="icon"
        disabled={currentPage === count}
      >
        <Icon name="chevron-right" width={20} height={20} />
      </Control>
    </nav>
  );
}

export type { Props as PaginationProps };
