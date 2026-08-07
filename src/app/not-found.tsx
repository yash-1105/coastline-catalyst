import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
};

/**
 * Eyebrow, headline, horizon line, one link. Nothing else: the
 * `data-page="404"` marker hides the footer from globals.css.
 */
export default function NotFound() {
  return (
    <main id="main" className={styles.main} data-page="404">
      <div className={styles.wrap}>
        <p className={styles.eyebrow}>404</p>
        <h1 className={styles.h1}>This page has drifted.</h1>
        <div className={styles.horizon} />
        <Link href="/" className={styles.link}>
          Back to home <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </main>
  );
}
