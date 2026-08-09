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

    /* A second, much later trigger for effects that need to be watched rather
       than merely fired. [data-reveal] runs at 15% entry, which is right for a
       fade-up but useless for the partner photo warming from grey to colour:
       at 15% the card has barely cleared the fold, so the transition finishes
       before anyone is looking at it, and the card's own fade-in masks what
       little is visible. 60% means the element is properly on screen. */
    const warm = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.warmed = 'true';
          warm.unobserve(entry.target);
        }
      },
      { threshold: 0.6 },
    );

    const observeAll = () => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')
        .forEach((el) => io.observe(el));
      document
        .querySelectorAll<HTMLElement>('[data-warm]:not([data-warmed])')
        .forEach((el) => warm.observe(el));
    };

    observeAll();

    // Picks up content added later, e.g. the portfolio filter re-rendering.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      warm.disconnect();
    };
  }, []);

  return null;
}
