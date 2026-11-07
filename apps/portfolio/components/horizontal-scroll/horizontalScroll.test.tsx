import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HorizontalScroll } from './HorizontalScroll';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('HorizontalScroll', () => {
  it('keeps converting wheel gestures after the hint is dismissed', async () => {
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('scrollX', 100);
    const scroll = vi.fn();
    vi.stubGlobal('scroll', scroll);
    const user = userEvent.setup();
    render(<HorizontalScroll dictionary={{ label: 'Scroll right' }} />);
    await user.click(screen.getByRole('button', { name: 'Scroll right' }));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 40 }));

    expect(scroll).toHaveBeenCalledWith(140, 0);
  });
});
