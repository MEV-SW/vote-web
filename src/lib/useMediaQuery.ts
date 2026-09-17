import { useSyncExternalStore } from 'react';

function subscribe(query: string, onStoreChange: () => void) {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', onStoreChange);
  return () => mql.removeEventListener('change', onStoreChange);
}

/** SSR-safe media query; defaults to `false` before hydrate. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribe(query, onStoreChange),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
