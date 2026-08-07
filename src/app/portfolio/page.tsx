import type { Metadata } from 'next';
import PortfolioGrid from './PortfolioGrid';
import { site } from '@/lib/site';
import styles from './portfolio.module.css';

export const metadata: Metadata = {
  title: 'Portfolio',
  description:
    'The companies Coastline Catalyst has backed: three teams, the beginning of the list.',
  alternates: { canonical: '/portfolio' },
  openGraph: {
    title: `Portfolio · ${site.name}`,
    description: 'Three teams. The beginning of the list.',
    url: '/portfolio',
  },
};

export default function PortfolioPage() {
  return (
    <main id="main">
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Portfolio</p>
          <h1 className={styles.h1}>Three teams. The beginning of the list.</h1>
          <div className={styles.horizon} />
          <p className={styles.subline}>
            Every company here was backed early, and every one still has our full attention.
          </p>
        </div>
      </section>

      <PortfolioGrid />
    </main>
  );
}
