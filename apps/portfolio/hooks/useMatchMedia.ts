import { useSyncExternalStore } from 'react';

export function useMatchMedia(
  mediaQuery: string,
  serverSnapshot = false
): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQueryList = window.matchMedia(mediaQuery);
      mediaQueryList.addEventListener('change', onStoreChange);
      return () => mediaQueryList.removeEventListener('change', onStoreChange);
    },
    () => window.matchMedia(mediaQuery).matches,
    () => serverSnapshot
  );
}
