import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useWheelToHorizontalScroll } from './useWheelToHorizontalScroll';

function installMediaQuery(matches: boolean) {
  const mediaQuery = Object.assign(new EventTarget(), {
    matches,
    media: '(min-width: 768px)',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  });
  vi.stubGlobal('matchMedia', () => mediaQuery);

  return mediaQuery;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useWheelToHorizontalScroll', () => {
  it.each([
    { deltaX: 0, deltaY: 40, expectedScrollX: 140 },
    { deltaX: 10, deltaY: -30, expectedScrollX: 70 },
    { deltaX: 20, deltaY: 20, expectedScrollX: 120 },
  ])(
    'scrolls horizontally to $expectedScrollX for wheel deltas ($deltaX, $deltaY)',
    ({ deltaX, deltaY, expectedScrollX }) => {
      installMediaQuery(true);
      vi.stubGlobal('scrollX', 100);
      const scroll = vi.fn();
      vi.stubGlobal('scroll', scroll);
      renderHook(useWheelToHorizontalScroll);

      window.dispatchEvent(new WheelEvent('wheel', { deltaX, deltaY }));

      expect(scroll).toHaveBeenCalledWith(expectedScrollX, 0);
    }
  );

  it('leaves horizontally dominant wheel gestures to the browser', () => {
    installMediaQuery(true);
    const scroll = vi.fn();
    vi.stubGlobal('scroll', scroll);
    renderHook(useWheelToHorizontalScroll);

    window.dispatchEvent(new WheelEvent('wheel', { deltaX: -40, deltaY: 10 }));

    expect(scroll).not.toHaveBeenCalled();
  });

  it('leaves wheel gestures unchanged on mobile', () => {
    installMediaQuery(false);
    const scroll = vi.fn();
    vi.stubGlobal('scroll', scroll);
    renderHook(useWheelToHorizontalScroll);

    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 40 }));

    expect(scroll).not.toHaveBeenCalled();
  });

  it('stops converting wheel gestures when the layout becomes mobile', () => {
    const mediaQuery = installMediaQuery(true);
    const scroll = vi.fn();
    vi.stubGlobal('scroll', scroll);
    renderHook(useWheelToHorizontalScroll);

    act(() => {
      mediaQuery.matches = false;
      mediaQuery.dispatchEvent(new Event('change'));
    });
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 40 }));

    expect(scroll).not.toHaveBeenCalled();
  });

  it('stops converting wheel gestures after unmount', () => {
    installMediaQuery(true);
    const scroll = vi.fn();
    vi.stubGlobal('scroll', scroll);
    const sut = renderHook(useWheelToHorizontalScroll);

    sut.unmount();
    window.dispatchEvent(new WheelEvent('wheel', { deltaY: 40 }));

    expect(scroll).not.toHaveBeenCalled();
  });
});
