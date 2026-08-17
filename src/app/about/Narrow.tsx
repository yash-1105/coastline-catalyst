'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './about.module.css';

/**
 * The two pieces of this page that have to know how narrow the screen is.
 *
 * Stacked in full, About is seven sections of label, heading, rule and prose:
 * on a phone that reads as one undifferentiated scroll. `Disclosure` folds the
 * supporting copy behind the row it belongs to, and `Rail` turns the capability
 * grid into a swipe track.
 *
 * Both keep one markup tree. `Disclosure` swaps its wrapper element rather than
 * rendering a phone copy next to a desktop one, so above the breakpoint the
 * page is the plain markup it has always been: no <summary> in the tab order,
 * and no toggle that could collapse a paragraph on a click. `Rail` renders the
 * same track element at every width and only asks for focus once it actually
 * overflows.
 *
 * Nothing a reveal animates ever moves inside a disclosure. Every
 * [data-reveal] stays on the row, outside the folded region, so a row expanded
 * long after the observer has fired still shows its drawn rule and its number
 * in their final state rather than the transparent one they start from.
 */

/** Kept in step by hand with the one breakpoint in about.module.css. */
const NARROW = '(max-width: 700px)';

function useNarrow() {
  /* Starts false so the first client render matches the server's, and corrects
     on mount. Nothing is seen folding away in between: every collapsible body
     sits inside a [data-reveal] element, which is transparent until the
     observer runs, and the observer runs on mount too. */
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(NARROW);
    const sync = () => setNarrow(mq.matches);

    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return narrow;
}

type DisclosureProps = {
  /** Applied to the wrapper at both widths, so the desktop box is untouched. */
  className?: string;
  /** Visible either way. Becomes the <summary> on a phone, so phrasing or
   *  heading content only. */
  summary?: ReactNode;
  /** Phone-only affordance, e.g. "Read more", for a fold with no title to tap. */
  hint?: string;
  /** Stands in for summary + children above the breakpoint. Only the partner
   *  bios need it: they are one paragraph at width, and splitting them at a
   *  sentence for the phone must not leave two paragraphs behind on desktop. */
  wide?: ReactNode;
  children: ReactNode;
};

export function Disclosure({ className, summary, hint, wide, children }: DisclosureProps) {
  const narrow = useNarrow();

  if (!narrow) {
    return (
      <div className={className}>
        {wide ?? (
          <>
            {summary}
            {children}
          </>
        )}
      </div>
    );
  }

  return (
    <details className={className}>
      <summary className={styles.disclosureSummary}>
        {summary}
        {hint ? <span className={styles.disclosureHint}>{hint}</span> : null}
        <span className={styles.disclosureChevron} aria-hidden="true" />
      </summary>
      <div className={styles.disclosureBody}>{children}</div>
    </details>
  );
}

type RailProps = {
  className: string;
  /** Names the track for anyone who reaches it by keyboard. */
  label: string;
  children: ReactNode;
};

/**
 * A grid at width, a swipe track on a phone. Which one it is comes from the
 * measurement rather than a media query: the track is only scrollable when it
 * overflows, and that is the same condition under which it needs a name, a tab
 * stop and a progress line. The desktop grid never overflows, so it gains none
 * of them.
 *
 * The line is drawn rather than left to the native scrollbar for the reason the
 * home page track gives: iOS hides scrollbars on touch, which is exactly where
 * the affordance is needed.
 */
export function Rail({ className, label, children }: RailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const max = track.scrollWidth - track.clientWidth;
    setScrollable(max > 8);
    if (fillRef.current) {
      fillRef.current.style.width = max > 0 ? `${(track.scrollLeft / max) * 100}%` : '0%';
    }
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    measure();
    track.addEventListener('scroll', measure, { passive: true });

    const observer = new ResizeObserver(measure);
    observer.observe(track);

    return () => {
      track.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, [measure]);

  return (
    <>
      <div
        ref={trackRef}
        className={`${className} cc-noscrollbar`}
        {...(scrollable ? { tabIndex: 0, role: 'region', 'aria-label': label } : {})}
      >
        {children}
      </div>
      {scrollable ? (
        <div className={styles.railBar} aria-hidden="true">
          <div ref={fillRef} className={styles.railBarFill} />
        </div>
      ) : null}
    </>
  );
}
