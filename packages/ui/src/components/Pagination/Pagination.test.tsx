import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from '.';
import type { PaginationProps } from './Pagination';

type PrevNextProps = PaginationProps['prevProps'];

const ellipsisLabel = '…';
const previousHref = '/prev';
const nextHref = '/next';

interface RenderOptions {
  count: number;
  currentIndex: number;
  prevProps?: PrevNextProps;
  nextProps?: PrevNextProps;
}

function renderPagination(options: RenderOptions) {
  const { count, currentIndex, prevProps = {}, nextProps = {} } = options;

  return render(
    <Pagination
      count={count}
      currentIndex={currentIndex}
      prevProps={prevProps}
      nextProps={nextProps}
      renderItem={(index) => (
        <Pagination.Item selected={index === currentIndex}>
          {index}
        </Pagination.Item>
      )}
    />
  );
}

// The previous/next controls are icon-only and therefore have no accessible
// name, so they are located by their fixed position inside the pagination nav.
function getControlAt(position: 'first' | 'last') {
  const navigation = screen.getByRole('navigation');
  const control =
    position === 'first'
      ? navigation.firstElementChild
      : navigation.lastElementChild;

  if (control === null) {
    throw new Error(`The pagination navigation has no ${position} control.`);
  }

  return control;
}

function getPreviousControl() {
  return getControlAt('first');
}

function getNextControl() {
  return getControlAt('last');
}

// Drops the icon-only previous/next controls, which carry no text content.
function getPageLabels() {
  return screen
    .getAllByRole('button')
    .map((control) => control.textContent)
    .filter((label) => label !== '');
}

describe('Pagination', () => {
  it('groups the controls in a navigation landmark', () => {
    renderPagination({ count: 5, currentIndex: 1 });

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders every page as an item when they all fit', () => {
    renderPagination({ count: 5, currentIndex: 3 });

    expect(getPageLabels()).toEqual(['1', '2', '3', '4', '5']);
  });

  it('collapses the skipped pages into an ellipsis item when there are many pages', () => {
    renderPagination({ count: 10, currentIndex: 1 });

    expect(getPageLabels()).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      ellipsisLabel,
      '10',
    ]);
  });

  it('renders the ellipsis item as a disabled control', () => {
    renderPagination({ count: 10, currentIndex: 1 });

    expect(screen.getByRole('button', { name: ellipsisLabel })).toBeDisabled();
  });

  it('marks the current page item with aria-current', () => {
    renderPagination({ count: 5, currentIndex: 3 });

    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it.each(['1', '2', '4', '5'])(
    'leaves page %s without aria-current',
    (pageLabel) => {
      renderPagination({ count: 5, currentIndex: 3 });

      expect(
        screen.getByRole('button', { name: pageLabel })
      ).not.toHaveAttribute('aria-current');
    }
  );

  it('disables the previous control on the first page', () => {
    renderPagination({ count: 5, currentIndex: 1 });

    expect(getPreviousControl()).toBeDisabled();
    expect(getNextControl()).not.toBeDisabled();
  });

  it('disables the next control on the last page', () => {
    renderPagination({ count: 5, currentIndex: 5 });

    expect(getNextControl()).toBeDisabled();
    expect(getPreviousControl()).not.toBeDisabled();
  });

  it('leaves both controls enabled on a middle page', () => {
    renderPagination({ count: 5, currentIndex: 3 });

    expect(getPreviousControl()).not.toBeDisabled();
    expect(getNextControl()).not.toBeDisabled();
  });

  it.each([
    { controlName: 'previous', getControl: getPreviousControl },
    { controlName: 'next', getControl: getNextControl },
  ])(
    'renders the $controlName control as a native button of type button by default',
    ({ getControl }) => {
      renderPagination({ count: 5, currentIndex: 3 });

      const control = getControl();

      expect(control).toBeInstanceOf(HTMLButtonElement);
      expect(control).toHaveAttribute('type', 'button');
    }
  );

  it.each([
    {
      controlName: 'previous',
      getControl: getPreviousControl,
      href: previousHref,
    },
    {
      controlName: 'next',
      getControl: getNextControl,
      href: nextHref,
    },
  ])(
    'renders the $controlName control as an anchor when its render element is given',
    ({ getControl, href }) => {
      renderPagination({
        count: 5,
        currentIndex: 3,
        // biome-ignore lint/a11y/useAnchorContent: the control renders its icon into this anchor
        prevProps: { render: <a href={previousHref} /> },
        // biome-ignore lint/a11y/useAnchorContent: the control renders its icon into this anchor
        nextProps: { render: <a href={nextHref} /> },
      });

      const control = getControl();

      expect(control).toBeInstanceOf(HTMLAnchorElement);
      expect(control).toHaveAttribute('href', href);
      expect(control).not.toHaveAttribute('role');
      expect(control).not.toHaveAttribute('type');
    }
  );

  it('forwards extra props to the previous control', () => {
    const previousControlId = 'pagination-previous';

    renderPagination({
      count: 5,
      currentIndex: 3,
      prevProps: { id: previousControlId },
    });

    expect(getPreviousControl()).toHaveAttribute('id', previousControlId);
  });

  it('forwards extra props to the next control', () => {
    const nextControlId = 'pagination-next';

    renderPagination({
      count: 5,
      currentIndex: 3,
      nextProps: { id: nextControlId },
    });

    expect(getNextControl()).toHaveAttribute('id', nextControlId);
  });

  it.each([
    { controlName: 'previous', getControl: getPreviousControl },
    { controlName: 'next', getControl: getNextControl },
  ])('calls the $controlName control handler on click', ({ getControl }) => {
    const handleClick = vi.fn();

    renderPagination({
      count: 5,
      currentIndex: 3,
      prevProps: { onClick: handleClick },
      nextProps: { onClick: handleClick },
    });

    fireEvent.click(getControl());

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
