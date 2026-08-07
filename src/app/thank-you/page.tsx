import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './thank-you.module.css';

export const metadata: Metadata = {
  title: 'Received',
  description: 'Your application has been received.',
  alternates: { canonical: '/thank-you' },
  robots: { index: false, follow: true },
};

export default function ThankYouPage() {
  return (
    <main id="main" className={styles.main}>
      <div className={styles.wrap}>
        <h1 className={styles.h1}>Received.</h1>
        <div className={styles.horizon} />
        <p className={styles.body}>
          We review every submission carefully. If there&rsquo;s a fit, you&rsquo;ll hear from us
          within two weeks.
        </p>
        <div className={styles.links}>
          <Link href="/" className={styles.link}>
            Back to home <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link href="/portfolio" className={styles.link}>
            View portfolio <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
