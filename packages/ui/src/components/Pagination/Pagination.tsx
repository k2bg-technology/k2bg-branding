import React from 'react';

import { Icon } from '../Icon';

import { usePagination } from './usePagination';
import { Item } from './Item/Item';

type PrevNextButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
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
    <nav {...rest} className="flex gap-4">
      <button
        {...prevProps}
        type="button"
        disabled={currentIndex === 1}
        className="flex p-[0.6rem] disabled:opacity-30"
      >
        <Icon name="chevron-left" width={20} height={20} />
      </button>
      <ul className="flex gap-4">
        {itemList.map((item) => (
          <li key={item}>
            {typeof item === 'number' ? (
              renderItem(item)
            ) : (
              <Item disabled>&hellip;</Item>
            )}
          </li>
        ))}
      </ul>
      <button
        {...nextProps}
        type="button"
        disabled={currentIndex === count}
        className="flex p-[0.6rem] disabled:opacity-30"
      >
        <Icon name="chevron-right" width={20} height={20} />
      </button>
    </nav>
  );
}
