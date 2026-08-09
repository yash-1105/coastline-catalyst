'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './CookieBanner.module.css';

const STORAGE_KEY = 'cc-cookie-choice';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  /* Deliberately post-mount, which is what the rule is objecting to. The
     server cannot read localStorage, so the banner has to start hidden and
     appear only once we know the visitor has not already answered. Rendering
     it optimistically would flash it at everyone who dismissed it long ago,
     and the one extra render it costs happens once per session on an element
     that is fixed-position and outside the page flow. */
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Storage blocked: stay quiet rather than nag on every page.
    }
  }, []);

  const choose = (value: 'accepted' | 'dismissed') => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Ignore: the choice simply will not persist.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div role="dialog" aria-label="Cookie notice" className={styles.banner}>
      <p className={styles.copy}>
        We use minimal analytics cookies to understand how the site is used.{' '}
        <Link href="/privacy">Privacy policy</Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.accept} onClick={() => choose('accepted')}>
          Accept
        </button>
        <button type="button" className={styles.dismiss} onClick={() => choose('dismissed')}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
