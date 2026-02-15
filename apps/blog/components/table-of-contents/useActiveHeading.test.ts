import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useActiveHeading } from './useActiveHeading';

const mockOn = vi.fn(() => vi.fn());

vi.mock('motion/react', () => ({
  useScroll: () => ({
    scrollY: { on: mockOn },
  }),
}));

vi.mock('../page-scroll-area/PageScrollArea', () => ({
  usePageScrollAreaStore: () => ({ current: document.createElement('div') }),
}));

describe('useActiveHeading', () => {
  it('returns empty string initially', () => {
    const { result } = renderHook(() => useActiveHeading(['heading-1']));

    expect(result.current).toBe('');
  });

  it('subscribes to scroll changes', () => {
    renderHook(() => useActiveHeading(['heading-1']));

    expect(mockOn).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('returns empty string when headingIds is empty', () => {
    const { result } = renderHook(() => useActiveHeading([]));

    expect(result.current).toBe('');
  });
});
