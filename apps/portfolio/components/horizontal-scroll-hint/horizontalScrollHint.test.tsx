import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HorizontalScrollHint } from './HorizontalScrollHint';

function installMediaQuery(matches: boolean) {
  vi.stubGlobal('matchMedia', () => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HorizontalScrollHint', () => {
  it('shows the dictionary label as a dismissible button on desktop', () => {
    installMediaQuery(true);

    render(<HorizontalScrollHint dictionary={{ label: 'Scroll right' }} />);

    expect(screen.getByRole('button', { name: 'Scroll right' })).toBeVisible();
  });

  it('does not show the hint on mobile', () => {
    installMediaQuery(false);

    render(<HorizontalScrollHint dictionary={{ label: 'Scroll right' }} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('dismisses the hint when activated', async () => {
    installMediaQuery(true);
    const user = userEvent.setup();
    render(<HorizontalScrollHint dictionary={{ label: 'Scroll right' }} />);

    await user.click(screen.getByRole('button', { name: 'Scroll right' }));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('keeps the hint visible when a scroll event has no horizontal progress', () => {
    installMediaQuery(true);
    vi.stubGlobal('scrollX', 0);
    render(<HorizontalScrollHint dictionary={{ label: 'Scroll right' }} />);

    act(() => window.dispatchEvent(new Event('scroll')));

    expect(screen.getByRole('button', { name: 'Scroll right' })).toBeVisible();
  });

  it('dismisses the hint after horizontal scrolling', () => {
    installMediaQuery(true);
    render(<HorizontalScrollHint dictionary={{ label: 'Scroll right' }} />);

    vi.stubGlobal('scrollX', 20);
    act(() => window.dispatchEvent(new Event('scroll')));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
