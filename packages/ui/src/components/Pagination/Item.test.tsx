import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Pagination } from '.';

const itemLabel = '2';
const itemHref = '/page/2';

describe('Pagination.Item', () => {
  it('marks the item as the current page when selected', () => {
    render(<Pagination.Item selected>{itemLabel}</Pagination.Item>);

    expect(screen.getByRole('button', { name: itemLabel })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('leaves the item without aria-current when not selected', () => {
    render(<Pagination.Item>{itemLabel}</Pagination.Item>);

    expect(screen.getByRole('button', { name: itemLabel })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('renders a native button of type button by default', () => {
    render(<Pagination.Item>{itemLabel}</Pagination.Item>);

    const item = screen.getByRole('button', { name: itemLabel });

    expect(item).toBeInstanceOf(HTMLButtonElement);
    expect(item).toHaveAttribute('type', 'button');
  });

  it('renders the given element instead of a button when render is passed', () => {
    render(
      <Pagination.Item render={<a href={itemHref} />}>
        {itemLabel}
      </Pagination.Item>
    );

    const item = screen.getByRole('link', { name: itemLabel });

    expect(item).toBeInstanceOf(HTMLAnchorElement);
    expect(item).toHaveAttribute('href', itemHref);
  });

  it('leaves a rendered anchor without a redundant role or type attribute', () => {
    render(
      <Pagination.Item render={<a href={itemHref} />}>
        {itemLabel}
      </Pagination.Item>
    );

    const item = screen.getByRole('link', { name: itemLabel });

    expect(item).not.toHaveAttribute('role');
    expect(item).not.toHaveAttribute('type');
  });

  it('marks a rendered anchor as the current page when selected', () => {
    render(
      <Pagination.Item selected render={<a href={itemHref} />}>
        {itemLabel}
      </Pagination.Item>
    );

    expect(screen.getByRole('link', { name: itemLabel })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('disables the item when disabled', () => {
    render(<Pagination.Item disabled>{itemLabel}</Pagination.Item>);

    expect(screen.getByRole('button', { name: itemLabel })).toBeDisabled();
  });

  it('forwards extra attributes to the rendered element', () => {
    const trackingId = 'article_click_pagination_2';

    render(
      <Pagination.Item data-gtm={trackingId}>{itemLabel}</Pagination.Item>
    );

    expect(screen.getByRole('button', { name: itemLabel })).toHaveAttribute(
      'data-gtm',
      trackingId
    );
  });
});
