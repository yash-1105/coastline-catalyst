import type { Metadata } from 'next';
import PitchForm from './PitchForm';
import { site } from '@/lib/site';
import styles from './submit-pitch.module.css';

export const metadata: Metadata = {
  // Labelled "Founder application", never "Contact".
  title: 'Founder application',
  description:
    "Tell us what you're building. We review every submission carefully. If there's a fit, we'll be in touch within two weeks.",
  alternates: { canonical: '/submit-pitch' },
  openGraph: {
    title: `Founder application · ${site.name}`,
    description: "Tell us what you're building.",
    url: '/submit-pitch',
  },
};

export default function SubmitPitchPage() {
  return (
    <main id="main">
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>Founder application</p>
          <h1 className={styles.h1}>Tell us what you&rsquo;re building.</h1>
          <p className={styles.sub}>
            We review every submission carefully. If there&rsquo;s a fit, we&rsquo;ll be in touch
            within two weeks.
          </p>
        </div>
      </section>

      <PitchForm />
    </main>
  );
}
