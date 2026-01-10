import { Button } from '../Button';
import { Icon } from '../Icon';
import { Item } from './Item';
import { usePagination } from './usePagination';

type PrevNextButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

export interface PaginationProps extends React.ComponentPropsWithoutRef<'nav'> {
  count: number;
  currentIndex: number;
  prevProps: PrevNextButtonProps;
  nextProps: PrevNextButtonProps;
  renderItem: (index: number) => React.ReactNode;
}

export default function Pagination(props: PaginationProps) {
  const { count, currentIndex, prevProps, nextProps, renderItem, ...rest } =
    props;

  const itemList = usePagination({ count, currentIndex });

  return (
    <nav {...rest} className="flex gap-normal">
      <Button
        {...prevProps}
        type="button"
        color="inherit"
        size="icon"
        disabled={currentIndex === 1}
      >
        <Icon name="chevron-left" width={20} height={20} />
      </Button>
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
      <Button
        {...nextProps}
        type="button"
        color="inherit"
        size="icon"
        disabled={currentIndex === count}
      >
        <Icon name="chevron-right" width={20} height={20} />
      </Button>
    </nav>
  );
}
