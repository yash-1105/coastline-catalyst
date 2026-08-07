'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/lib/motion';
import styles from './PageTransition.module.css';

/**
 * Route change: a navy panel wipes up from the bottom and away, 500ms.
 * Purely decorative, never interactive, and skipped under reduced motion.
 */
export default function PageTransition() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const firstRender = useRef(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setRun((n) => n + 1);
  }, [pathname]);

  if (reduced || run === 0) return null;

  return <div key={run} className={styles.wipe} aria-hidden="true" />;
}
