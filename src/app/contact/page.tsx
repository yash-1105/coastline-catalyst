import type { Metadata } from 'next';
import Link from 'next/link';
import ContactForm from './ContactForm';
import { site } from '@/lib/site';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with Coastline Catalyst. For pitches, please use the founder application.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: `Contact · ${site.name}`,
    description: 'Get in touch with Coastline Catalyst.',
    url: '/contact',
  },
};

export default function ContactPage() {
  const externalLinkedIn = site.linkedinUrl.startsWith('http');

  return (
    <main id="main">
      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Contact</p>
          <h1 className={styles.h1}>Say hello.</h1>

          <div className={styles.grid}>
            <div className={styles.details}>
              <div>
                <p className={styles.detailLabel}>Email</p>
                <a href={`mailto:${site.email}`} className={styles.detailLink}>
                  {site.email}
                </a>
              </div>

              <div>
                <p className={styles.detailLabel}>LinkedIn</p>
                <a
                  href={site.linkedinUrl}
                  className={styles.detailLink}
                  target={externalLinkedIn ? '_blank' : undefined}
                  rel={externalLinkedIn ? 'noreferrer' : undefined}
                >
                  {site.name}
                </a>
              </div>

              <div>
                <p className={styles.detailLabel}>Location</p>
                <p className={styles.detailValue}>{site.location}</p>
              </div>

              <div className={styles.pitchNote}>
                <Link href="/submit-pitch" className={styles.pitchLink}>
                  For pitches, please use the founder application{' '}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            <div className={styles.formColumn}>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
