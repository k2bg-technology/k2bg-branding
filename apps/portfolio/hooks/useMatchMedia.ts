import { useSyncExternalStore } from 'react';

export function useMatchMedia(
  mediaQuery: string,
  initialState = false
): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const matchMediaList = window.matchMedia(mediaQuery);
      matchMediaList.addEventListener('change', onStoreChange);
      return () => matchMediaList.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(mediaQuery).matches,
    () => initialState
  );
}
