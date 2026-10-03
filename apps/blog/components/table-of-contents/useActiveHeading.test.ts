import { act, cleanup, renderHook } from '@testing-library/react';
import { motionValue } from 'motion';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useActiveHeading } from './useActiveHeading';

const scrollY = motionValue(0);
const containerRef = { current: document.createElement('div') };

vi.mock('motion/react', () => ({
  useScroll: () => ({ scrollY }),
}));

vi.mock('../page-scroll-area/PageScrollArea', () => ({
  usePageScrollAreaStore: () => containerRef,
}));

describe('useActiveHeading', () => {
  beforeEach(() => {
    scrollY.set(0);
  });

  afterEach(() => {
    cleanup();
    containerRef.current.replaceChildren();
    containerRef.current.remove();
    vi.restoreAllMocks();
  });

  it('returns empty string initially', () => {
    const { result } = renderHook(() => useActiveHeading(['heading-1']));

    expect(result.current).toBe('');
  });

  it('updates the active heading when scrolling past the container-relative threshold', () => {
    const introduction = document.createElement('h2');
    introduction.id = 'introduction';
    const conclusion = document.createElement('h2');
    conclusion.id = 'conclusion';
    containerRef.current.append(introduction, conclusion);
    document.body.append(containerRef.current);
    vi.spyOn(containerRef.current, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(0, 250, 600, 800)
    );
    vi.spyOn(introduction, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(0, 300 - scrollY.get(), 600, 40)
    );
    vi.spyOn(conclusion, 'getBoundingClientRect').mockImplementation(
      () => new DOMRect(0, 500 - scrollY.get(), 600, 40)
    );
    const headingIds = [introduction.id, conclusion.id];
    const { result } = renderHook(() => useActiveHeading(headingIds));

    act(() => scrollY.set(50));

    expect(result.current).toBe(introduction.id);

    act(() => scrollY.set(150));

    expect(result.current).toBe(conclusion.id);
  });

  it('returns empty string when headingIds is empty', () => {
    const { result } = renderHook(() => useActiveHeading([]));

    expect(result.current).toBe('');
  });
});
