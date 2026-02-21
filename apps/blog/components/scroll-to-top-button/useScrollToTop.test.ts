import { act, renderHook } from '@testing-library/react';
import { type MotionValue, motionValue } from 'motion/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePageScrollAreaStore } from '../page-scroll-area/PageScrollArea';
import { useScrollToTop } from './useScrollToTop';

let mockScrollY: MotionValue<number>;

vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();
  return {
    ...actual,
    useScroll: () => ({ scrollY: mockScrollY }),
  };
});

function simulateScroll(scrollY: MotionValue<number>, value: number) {
  act(() => {
    scrollY.set(value);
  });
}

describe('useScrollToTop', () => {
  const scrollToMock = vi.fn();

  beforeEach(() => {
    mockScrollY = motionValue(0);
    scrollToMock.mockClear();

    const ref = { current: { scrollTo: scrollToMock } };
    usePageScrollAreaStore.setState({
      ref: ref as unknown as React.RefObject<HTMLDivElement | null>,
    });
  });

  it('returns isVisible as false when scroll position is below threshold', () => {
    const { result } = renderHook(() => useScrollToTop());

    simulateScroll(mockScrollY, 100);

    expect(result.current.isVisible).toBe(false);
  });

  it('returns isVisible as true when scroll position exceeds threshold', () => {
    const { result } = renderHook(() => useScrollToTop());

    simulateScroll(mockScrollY, 301);

    expect(result.current.isVisible).toBe(true);
  });

  it('updates isVisible when scroll position crosses threshold', () => {
    const { result } = renderHook(() => useScrollToTop());

    simulateScroll(mockScrollY, 400);
    expect(result.current.isVisible).toBe(true);

    simulateScroll(mockScrollY, 100);
    expect(result.current.isVisible).toBe(false);
  });

  it('calls scrollTo with smooth behavior when scrollToTop is invoked', () => {
    const { result } = renderHook(() => useScrollToTop());

    act(() => {
      result.current.scrollToTop();
    });

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('returns isVisible as false at exactly the threshold value', () => {
    const { result } = renderHook(() => useScrollToTop());

    const scrollThreshold = 300;
    simulateScroll(mockScrollY, scrollThreshold);

    expect(result.current.isVisible).toBe(false);
  });
});
