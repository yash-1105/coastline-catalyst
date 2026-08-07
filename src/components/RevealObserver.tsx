'use client';

import { useEffect } from 'react';

/**
 * One observer for the whole page. Any element carrying `data-reveal="<ms>"`
 * fades in and rises 24px at 15% viewport entry, with the attribute value as
 * its stagger delay. Each element fires once and is then unobserved, so a
 * reveal never re-triggers. The hidden state lives in globals.css under `.js`,
 * which keeps no-JS visitors on fully visible content.
 */
export default function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.style.transitionDelay = `${Number(el.dataset.reveal) || 0}ms`;
          el.dataset.revealed = 'true';
          io.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')
        .forEach((el) => io.observe(el));
    };

    observeAll();

    // Picks up content added later, e.g. the portfolio filter re-rendering.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
