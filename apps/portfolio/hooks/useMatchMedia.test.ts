import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useMatchMedia } from './useMatchMedia';

function installMatchMedia(initialMatches: boolean) {
  const state = { matches: initialMatches };
  const listeners = new Set<() => void>();

  window.matchMedia = (query: string) =>
    ({
      media: query,
      get matches() {
        return state.matches;
      },
      addEventListener: (_type: string, listener: () => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: () => void) => {
        listeners.delete(listener);
      },
    }) as unknown as MediaQueryList;

  return {
    change(nextMatches: boolean) {
      state.matches = nextMatches;
      listeners.forEach((listener) => {
        listener();
      });
    },
  };
}

describe('useMatchMedia', () => {
  it('returns whether the media query matches when mounted', () => {
    installMatchMedia(true);

    const { result } = renderHook(() => useMatchMedia('(min-width: 768px)'));

    expect(result.current).toBe(true);
  });

  it('returns the new result when the media query stops matching after a rerender', () => {
    const mediaQuery = installMatchMedia(true);
    const { result, rerender } = renderHook(() =>
      useMatchMedia('(min-width: 768px)')
    );
    rerender();

    act(() => mediaQuery.change(false));

    expect(result.current).toBe(false);
  });
});
