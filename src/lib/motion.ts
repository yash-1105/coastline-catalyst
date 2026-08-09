'use client';

import { useEffect, useRef, useState } from 'react';

export const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Tracks the reduced-motion preference. Starts `false` on the server so
 * markup matches, then settles on the real value after mount.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return reduced;
}

/**
 * Runs `onFrame` on scroll and resize, throttled to one animation frame.
 * Pass `enabled: false` to opt out entirely (reduced motion).
 */
export function useRafScroll(onFrame: () => void, enabled = true) {
  const cb = useRef(onFrame);
  /* Assigned in an effect rather than during render. The rAF loop only reads
     this on animation frames, which run after effects flush, so it never sees
     a stale callback. */
  useEffect(() => {
    cb.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!enabled) return;

    let ticking = false;
    const run = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        cb.current();
        ticking = false;
      });
    };

    window.addEventListener('scroll', run, { passive: true });
    window.addEventListener('resize', run);
    run();

    return () => {
      window.removeEventListener('scroll', run);
      window.removeEventListener('resize', run);
    };
  }, [enabled]);
}

/** Matches a media query, `false` until mounted. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);

  return matches;
}

export const clamp = (n: number, min = 0, max = 1) => Math.min(max, Math.max(min, n));
