import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TocHeading } from './extractHeadings';
import { TableOfContents } from './TableOfContents';

vi.mock('./useActiveHeading', () => ({
  useActiveHeading: () => 'introduction',
}));

vi.mock('../page-scroll-area/PageScrollArea', () => ({
  usePageScrollAreaStore: () => ({
    current: {
      getBoundingClientRect: () => ({ top: 0 }),
      scrollTop: 0,
      scrollTo: vi.fn(),
    },
  }),
}));

vi.mock('ui', async () => {
  const React = await vi.importActual<typeof import('react')>('react');

  const PopoverContext = React.createContext<{
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>({});

  const PopoverRoot = ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (
    <PopoverContext.Provider value={{ open, onOpenChange }}>
      <div>{children}</div>
    </PopoverContext.Provider>
  );
  PopoverRoot.Trigger = ({ children }: { children: React.ReactNode }) => {
    const { open, onOpenChange } = React.useContext(PopoverContext);
    return (
      <div role="none" onClick={() => onOpenChange?.(!open)}>
        {children}
      </div>
    );
  };
  PopoverRoot.Content = ({ children }: { children: React.ReactNode }) => {
    const { open } = React.useContext(PopoverContext);
    if (!open) return null;
    return <div>{children}</div>;
  };
  PopoverRoot.Close = ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  );

  return {
    Button: (props: React.ComponentProps<'button'>) => (
      <button {...props}>{props.children}</button>
    ),
    Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
    ScrollArea: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    Popover: PopoverRoot,
  };
});

const headings: TocHeading[] = [
  { id: 'introduction', text: 'Introduction', level: 2 },
  { id: 'sub-section', text: 'Sub Section', level: 3 },
  { id: 'conclusion', text: 'Conclusion', level: 2 },
];

describe('TableOfContents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('returns null when headings array is empty', () => {
    const { container } = render(<TableOfContents headings={[]} />);

    expect(container.innerHTML).toBe('');
  });

  it('renders toggle button with list-bullet icon when collapsed', () => {
    render(<TableOfContents headings={headings} />);

    expect(
      screen.getByRole('button', { name: '目次を開く' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('icon-list-bullet')).toBeInTheDocument();
  });

  it('expands panel and shows headings when button is clicked', async () => {
    const user = userEvent.setup();

    render(<TableOfContents headings={headings} />);

    await user.click(screen.getByRole('button', { name: '目次を開く' }));

    expect(
      screen.getByRole('navigation', { name: '目次' })
    ).toBeInTheDocument();
    expect(screen.getByText('Introduction')).toBeInTheDocument();
    expect(screen.getByText('Sub Section')).toBeInTheDocument();
    expect(screen.getByText('Conclusion')).toBeInTheDocument();
  });

  it('shows x-mark icon when expanded', async () => {
    const user = userEvent.setup();

    render(<TableOfContents headings={headings} />);

    await user.click(screen.getByRole('button', { name: '目次を開く' }));

    expect(screen.getByTestId('icon-x-mark')).toBeInTheDocument();
  });

  it('updates aria-expanded when toggled', async () => {
    const user = userEvent.setup();

    render(<TableOfContents headings={headings} />);
    const button = screen.getByRole('button', { name: '目次を開く' });

    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);

    const expandedButton = screen.getByRole('button', { name: '目次を閉じる' });
    expect(expandedButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('scrolls to the heading when a heading is clicked', async () => {
    const user = userEvent.setup();
    const mockElement = document.createElement('div');
    mockElement.getBoundingClientRect = () => ({ top: 200 }) as DOMRect;
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement);

    render(<TableOfContents headings={headings} />);

    await user.click(screen.getByRole('button', { name: '目次を開く' }));
    await user.click(screen.getByText('Conclusion'));

    expect(document.getElementById).toHaveBeenCalledWith('conclusion');
    expect(
      screen.getByRole('navigation', { name: '目次' })
    ).toBeInTheDocument();
  });
});
