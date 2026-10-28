import { useCallback, useEffect, useState } from 'react';
import type { ChapterId } from '../data/types';
import { chapters } from '../data/siteConfig';

export type Route = { kind: 'home' } | { kind: 'chapter'; id: ChapterId };

export function parseHash(hash: string): Route {
  const m = /^#\/c\/([a-z]+)$/.exec(hash);
  if (m) {
    const found = chapters.find((c) => c.id === m[1]);
    if (found) return { kind: 'chapter', id: found.id };
  }
  return { kind: 'home' };
}

export function routeToHash(route: Route): string {
  return route.kind === 'chapter' ? `#/c/${route.id}` : '#/';
}

export function routeKey(route: Route): string {
  return route.kind === 'chapter' ? route.id : 'home';
}

/** مسیریابی با hash؛ دکمهٔ «بازگشت» اندروید هم درست کار می‌کند. */
export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((r: Route) => {
    const target = routeToHash(r);
    if (window.location.hash === target) {
      setRoute(r);
    } else {
      window.location.hash = target;
    }
  }, []);

  return [route, navigate];
}
