'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { navLinks } from '@/lib/site';
import { useRafScroll } from '@/lib/motion';
import styles from './SiteHeader.module.css';

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  /** Transparent only over the Home hero. Every other page starts solid. */
  const alwaysSolid = !isHome;
  /* Home shows scroll progress on the left-gutter spine, so the header line
     there would say the same thing twice. Every other page keeps it. */
  const showProgress = !isHome;

  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [navOpen, setNavOpen] = useState(false);

  useRafScroll(() => {
    const header = headerRef.current;
    if (!header) return;

    header.dataset.solid = String(alwaysSolid || window.scrollY > 8);

    const bar = progressRef.current;
    if (bar) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0%';
    }
  });

  // Close the panel on navigation.
  useEffect(() => setNavOpen(false), [pathname]);

  // Escape closes it, and the page behind must not scroll while it is open.
  useEffect(() => {
    if (!navOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setNavOpen(false);
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [navOpen]);

  return (
    <>
      <header ref={headerRef} className={styles.header} data-solid={alwaysSolid}>
        <div className={styles.inner}>
          <Link href="/" aria-label="Coastline Catalyst home" className={styles.brand}>
            <Logo size={52} priority />
            <span className={styles.wordmark}>Coastline Catalyst</span>
          </Link>

          <nav className={styles.nav} aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className={styles.link}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/submit-pitch" className={styles.cta}>
              Submit pitch deck
            </Link>
          </nav>

          <button
            type="button"
            className={styles.burger}
            aria-label="Open menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        {showProgress && <div ref={progressRef} className={styles.progress} />}
      </header>

      {navOpen && (
        <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className={styles.panelClose}
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
            autoFocus
          >
            ×
          </button>
          <nav className={styles.panelNav} aria-label="Mobile">
            {navLinks.map((link, i) => (
              <Link
                key={link.key}
                href={link.href}
                className={styles.panelLink}
                style={{ animationDelay: `${i * 70 + 120}ms` }}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/submit-pitch" className={styles.panelCta}>
              Submit pitch deck
            </Link>
          </nav>
        </div>
      )}

      {/* The Home hero sits under the transparent header; every other page needs the offset. */}
      {alwaysSolid && <div className={styles.spacer} />}
    </>
  );
}
