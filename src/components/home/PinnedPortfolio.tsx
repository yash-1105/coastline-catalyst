'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import CompanyLogo from '@/components/CompanyLogo';
import { companies } from '@/lib/site';
import { clamp, useRafScroll } from '@/lib/motion';
import styles from './PinnedPortfolio.module.css';

type Mode = 'pin' | 'swipe' | 'grid';

export default function PinnedPortfolio() {
  /* Mobile-first default: the swipe carousel renders on the server and the
     desktop pin is applied once we know the viewport and motion preference. */
  const [mode, setMode] = useState<Mode>('swipe');
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 900px)');

    const sync = () => setMode(reduced.matches ? 'grid' : desktop.matches ? 'pin' : 'swipe');
    sync();

    reduced.addEventListener('change', sync);
    desktop.addEventListener('change', sync);
    return () => {
      reduced.removeEventListener('change', sync);
      desktop.removeEventListener('change', sync);
    };
  }, []);

  // Pin mode: scroll progress through the 250vh section drives the track's X.
  useRafScroll(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const range = section.offsetHeight - window.innerHeight;
    if (range <= 0) return;

    const progress = clamp(-section.getBoundingClientRect().top / range);
    const maxX = Math.max(0, track.scrollWidth - track.clientWidth);

    track.style.transform = `translateX(${(-progress * maxX).toFixed(1)}px)`;
    if (fillRef.current) fillRef.current.style.width = `${(progress * 100).toFixed(2)}%`;
  }, mode === 'pin');

  // Swipe mode: the native scroll of the track drives the same progress line.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || mode !== 'swipe') return;

    const onScroll = () => {
      const maxX = track.scrollWidth - track.clientWidth;
      if (fillRef.current) {
        fillRef.current.style.width = maxX > 0 ? `${(track.scrollLeft / maxX) * 100}%` : '0%';
      }
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => track.removeEventListener('scroll', onScroll);
  }, [mode]);

  // Leaving pin mode must not strand the track mid-translate.
  useEffect(() => {
    if (mode === 'pin') return;
    if (trackRef.current) trackRef.current.style.transform = '';
    if (fillRef.current) fillRef.current.style.width = '0%';
  }, [mode]);

  return (
    <section ref={sectionRef} className={styles.section} data-mode={mode} data-sec>
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Portfolio</p>
            <h2 className={styles.h2}>Where we&rsquo;ve invested</h2>
          </div>
          <div className={styles.headRight}>
            <Link href="/portfolio" className={styles.viewAll}>
              View all <span aria-hidden="true">&rarr;</span>
            </Link>
            <span aria-hidden="true" className={styles.index}>
              05 / 07
            </span>
          </div>
        </div>

        <div ref={trackRef} className={`${styles.track} cc-noscrollbar`}>
          {companies.map((company) => {
            const external = company.url.startsWith('http');
            return (
              <article key={company.name} className={styles.card}>
                <CompanyLogo company={company} className={styles.tile} size={40} />
                <h3 className={styles.name}>{company.name}</h3>
                <p className={styles.desc}>{company.desc}</p>
                <p className={styles.founders}>{company.founders}</p>
                <div className={styles.meta}>
                  <span className={styles.pill}>{company.industry}</span>
                  <span className={styles.status}>
                    <span className={styles.dot} aria-hidden="true" />
                    {company.status}
                  </span>
                </div>
                <a
                  href={company.url}
                  className={styles.cardLink}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                >
                  View company{' '}
                  <span aria-hidden="true">&rarr;</span>
                  <span className="cc-visually-hidden">{`: ${company.name}`}</span>
                </a>
              </article>
            );
          })}
        </div>

        <div className={styles.progressWrap}>
          <div className={styles.progressTrack}>
            <div ref={fillRef} className={styles.progressFill} />
          </div>
        </div>
      </div>
    </section>
  );
}
