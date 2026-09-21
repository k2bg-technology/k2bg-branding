import { act, renderHook } from '@testing-library/react';
import { type MotionValue, motionValue } from 'motion/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePageScrollAreaStore } from '../page-scroll-area/PageScrollArea';
import { useScrollToTop } from './useScrollToTop';

const { mockUseScroll } = vi.hoisted(() => ({ mockUseScroll: vi.fn() }));

vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();
  return {
    ...actual,
    useScroll: mockUseScroll,
  };
});

function simulateScroll(scrollY: MotionValue<number>, value: number) {
  act(() => {
    scrollY.set(value);
  });
}

function renderUseScrollToTop() {
  const scrollY = motionValue(0);
  mockUseScroll.mockReturnValue({ scrollY });

  return { ...renderHook(() => useScrollToTop()), scrollY };
}

describe('useScrollToTop', () => {
  const scrollToMock = vi.fn();

  beforeEach(() => {
    mockUseScroll.mockReset();
    scrollToMock.mockClear();

    const ref = { current: { scrollTo: scrollToMock } };
    usePageScrollAreaStore.setState({
      ref: ref as unknown as React.RefObject<HTMLDivElement | null>,
    });
  });

  it('returns isVisible as false when scroll position is below threshold', () => {
    const { result, scrollY } = renderUseScrollToTop();

    simulateScroll(scrollY, 100);

    expect(result.current.isVisible).toBe(false);
  });

  it('returns isVisible as true when scroll position exceeds threshold', () => {
    const { result, scrollY } = renderUseScrollToTop();

    simulateScroll(scrollY, 301);

    expect(result.current.isVisible).toBe(true);
  });

  it('updates isVisible when scroll position crosses threshold', () => {
    const { result, scrollY } = renderUseScrollToTop();

    simulateScroll(scrollY, 400);
    expect(result.current.isVisible).toBe(true);

    simulateScroll(scrollY, 100);
    expect(result.current.isVisible).toBe(false);
  });

  it('calls scrollTo with smooth behavior when scrollToTop is invoked', () => {
    const { result } = renderUseScrollToTop();

    act(() => {
      result.current.scrollToTop();
    });

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('returns isVisible as false at exactly the threshold value', () => {
    const { result, scrollY } = renderUseScrollToTop();

    const scrollThreshold = 300;
    simulateScroll(scrollY, scrollThreshold);

    expect(result.current.isVisible).toBe(false);
  });
});
