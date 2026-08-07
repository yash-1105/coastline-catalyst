import type { Metadata } from 'next';
import {
  privacyLastUpdated,
  privacyPostalAddress,
  privacySections,
  site,
} from '@/lib/site';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description:
    'How Coastline Catalyst collects, uses, and protects the information you share with us.',
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: `Privacy policy · ${site.name}`,
    description: 'How we handle your information.',
    url: '/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <main id="main">
      <section className={styles.section}>
        <div className={styles.layout}>
          <nav className={styles.toc} aria-label="Table of contents">
            <p className={styles.tocLabel}>Contents</p>
            <div className={styles.tocList}>
              {privacySections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className={styles.tocLink}>
                  {section.tocLabel}
                </a>
              ))}
            </div>
          </nav>

          <article className={styles.article}>
            <p className={styles.eyebrow}>Privacy policy</p>
            <h1 className={styles.h1}>How we handle your information</h1>
            <p className={styles.updated}>Last updated: {privacyLastUpdated}</p>

            {privacySections.map((section) => (
              <section key={section.id}>
                <h2 id={section.id} className={styles.h2}>
                  {section.heading}
                </h2>
                {section.id === 'contact' ? (
                  <p className={styles.p}>
                    {section.body} <a href={`mailto:${site.email}`}>{site.email}</a>, or by post
                    at {privacyPostalAddress}.
                  </p>
                ) : (
                  <p className={styles.p}>{section.body}</p>
                )}
              </section>
            ))}
          </article>
        </div>
      </section>
    </main>
  );
}
