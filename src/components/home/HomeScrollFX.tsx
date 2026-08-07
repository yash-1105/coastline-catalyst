'use client';

import { useEffect, useRef, useState } from 'react';
import { EASE, clamp, useRafScroll, useReducedMotion } from '@/lib/motion';
import styles from './Home.module.css';

/**
 * One rAF-throttled loop drives every scroll effect on Home: hero parallax,
 * the word fill, the numbered rows, and the left-gutter spine. Everything
 * touches transform, opacity or colour only, and nothing runs under
 * `prefers-reduced-motion: reduce`.
 */
export default function HomeScrollFX() {
  const reduced = useReducedMotion();
  const [dots, setDots] = useState<number[]>([]);
  const [active, setActive] = useState(0);

  const spineFillRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLElement[]>([]);
  const wordsRef = useRef<HTMLElement[]>([]);
  const rowsRef = useRef<HTMLElement[]>([]);
  const cueGone = useRef(false);
  const lastFilled = useRef(-1);

  // Collect targets and place the spine dots at each section's midpoint.
  useEffect(() => {
    if (reduced) return;

    sectionsRef.current = Array.from(document.querySelectorAll<HTMLElement>('main [data-sec]'));
    wordsRef.current = Array.from(document.querySelectorAll<HTMLElement>('[data-who-word]'));
    rowsRef.current = Array.from(document.querySelectorAll<HTMLElement>('[data-wrow]'));

    const measure = () => {
      const docHeight = document.documentElement.scrollHeight;
      setDots(
        sectionsRef.current.map((section) =>
          Math.min(99, ((section.offsetTop + section.offsetHeight / 2) / docHeight) * 100),
        ),
      );
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [reduced]);

  /* Investment focus band: each column's top hairline draws and its value
     rises from behind a mask, 700ms, 110ms stagger, triggered once at 20%. */
  useEffect(() => {
    if (reduced) return;

    const viewport = window.innerHeight;
    const pending = Array.from(
      document.querySelectorAll<HTMLElement>('[data-focus-item]'),
    ).filter((el) => el.getBoundingClientRect().top > viewport);

    if (!pending.length) return;

    pending.forEach((el, i) => {
      const transition = `transform .7s ${EASE} ${i * 110}ms`;
      const line = el.querySelector<HTMLElement>('[data-focus-line]');
      const value = el.querySelector<HTMLElement>('[data-focus-value]');
      if (line) {
        line.style.transform = 'scaleX(0)';
        line.style.transition = transition;
      }
      if (value) {
        value.style.transform = 'translateY(110%)';
        value.style.transition = transition;
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        pending.forEach((el) => {
          const line = el.querySelector<HTMLElement>('[data-focus-line]');
          const value = el.querySelector<HTMLElement>('[data-focus-value]');
          if (line) line.style.transform = 'scaleX(1)';
          if (value) value.style.transform = 'translateY(0)';
        });
        io.disconnect();
      },
      { threshold: 0.2 },
    );

    const band = pending[0].closest('section');
    if (band) io.observe(band);

    return () => io.disconnect();
  }, [reduced]);

  useRafScroll(() => {
    const y = window.scrollY;
    const viewport = window.innerHeight;

    /* The hero's own parallax, crescent and SVG waves are gone: the pinned
       video does that work now, and the copy's fade and drift are driven in
       CSS from ScrollVideo's --p. */

    // The scroll cue fades permanently once the page has moved.
    if (!cueGone.current && y > 40) {
      const cue = document.querySelector<HTMLElement>('[data-cue]');
      if (cue) {
        cueGone.current = true;
        cue.style.transition = 'opacity .5s ease';
        cue.style.opacity = '0';
      }
    }

    // Who we are: words fill from Rule grey to Ink as the paragraph rises.
    const who = document.querySelector<HTMLElement>('[data-who]');
    const words = wordsRef.current;
    if (who && words.length) {
      const rect = who.getBoundingClientRect();
      const progress = clamp((viewport * 0.85 - rect.top) / (viewport * 0.35));
      const filled = Math.round(progress * words.length);
      if (filled !== lastFilled.current) {
        words.forEach((word, i) => {
          word.style.color = i < filled ? 'var(--ink)' : 'var(--rule)';
        });
        lastFilled.current = filled;
      }
    }

    // Numbered rows turn navy as they cross the middle of the viewport.
    rowsRef.current.forEach((row) => {
      if (row.dataset.on || row.getBoundingClientRect().top > viewport * 0.55) return;
      row.dataset.on = '1';
      const num = row.querySelector<HTMLElement>('[data-wnum]');
      const line = row.querySelector<HTMLElement>('[data-wline]');
      if (num) {
        num.style.transition = 'color .5s ease';
        num.style.color = 'var(--navy)';
      }
      if (line) {
        line.style.transition = `transform .7s ${EASE}`;
        line.style.transform = 'scaleX(1)';
      }
    });

    // Spine: navy fill grows from the top, the active dot swells and fills.
    const total = document.documentElement.scrollHeight - viewport;
    if (spineFillRef.current && total > 0) {
      spineFillRef.current.style.height = `${Math.min(100, (y / total) * 100).toFixed(2)}%`;
    }

    let current = 0;
    sectionsRef.current.forEach((section, i) => {
      if (section.getBoundingClientRect().top < viewport * 0.5) current = i;
    });
    setActive((previous) => (previous === current ? previous : current));
  }, !reduced);

  if (reduced || !dots.length) return null;

  return (
    <div className={styles.spine} aria-hidden="true">
      <div ref={spineFillRef} className={styles.spineFill} />
      {dots.map((top, i) => (
        <div
          key={i}
          className={styles.spineDot}
          style={{ top: `${top.toFixed(1)}%` }}
          data-active={i === active}
        />
      ))}
    </div>
  );
}
