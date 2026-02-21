import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ScrollToTopButton } from './ScrollToTopButton';

const mockScrollToTop = vi.fn();

vi.mock('./useScrollToTop', () => ({
  useScrollToTop: () => ({
    isVisible: mockIsVisible,
    scrollToTop: mockScrollToTop,
  }),
}));

vi.mock('ui', () => ({
  Button: (props: React.ComponentProps<'button'>) => (
    <button {...props}>{props.children}</button>
  ),
  Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}));

vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
    motion: {
      div: ({ children, ...rest }: React.PropsWithChildren) => (
        <div {...rest}>{children}</div>
      ),
    },
  };
});

let mockIsVisible = false;

describe('ScrollToTopButton', () => {
  beforeEach(() => {
    mockIsVisible = false;
    mockScrollToTop.mockClear();
  });

  it('does not render button when isVisible is false', () => {
    mockIsVisible = false;

    render(<ScrollToTopButton />);

    expect(
      screen.queryByRole('button', { name: 'ページの先頭へ戻る' })
    ).not.toBeInTheDocument();
  });

  it('renders button when isVisible is true', () => {
    mockIsVisible = true;

    render(<ScrollToTopButton />);

    expect(
      screen.getByRole('button', { name: 'ページの先頭へ戻る' })
    ).toBeInTheDocument();
  });

  it('calls scrollToTop on click', async () => {
    mockIsVisible = true;
    const user = userEvent.setup();

    render(<ScrollToTopButton />);

    await user.click(
      screen.getByRole('button', { name: 'ページの先頭へ戻る' })
    );

    expect(mockScrollToTop).toHaveBeenCalledOnce();
  });

  it('renders chevron-up icon', () => {
    mockIsVisible = true;

    render(<ScrollToTopButton />);

    expect(screen.getByTestId('icon-chevron-up')).toBeInTheDocument();
  });
});
