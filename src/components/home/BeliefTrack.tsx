'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BeliefIcon } from '@/components/Icons';
import { believe } from '@/lib/site';
import styles from './Home.module.css';

/**
 * The "What we believe" columns. One row on desktop, a horizontal swipe track
 * on a phone.
 *
 * The progress line is drawn rather than left to the native scrollbar: iOS
 * hides scrollbars on touch devices, so `::-webkit-scrollbar` styling would
 * show nothing on exactly the devices that need the affordance. It appears
 * only when the track actually overflows, so the desktop row stays clean.
 */
export default function BeliefTrack() {
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
    <div className={styles.believeCol}>
      <div ref={trackRef} className={styles.believeTrack}>
        {believe.map((item, i) => (
          <div key={item.title} className={styles.believeItem} data-reveal={i * 80}>
            <BeliefIcon name={item.icon} />
            <h3 className={styles.believeTitle}>{item.title}</h3>
            <p className={styles.believeBody}>{item.body}</p>
          </div>
        ))}
      </div>

      <div className={styles.believeBar} data-visible={scrollable} aria-hidden="true">
        <div ref={fillRef} className={styles.believeBarFill} />
      </div>
    </div>
  );
}
