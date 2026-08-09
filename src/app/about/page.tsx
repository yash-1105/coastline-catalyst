import type { Metadata } from 'next';
import Image from 'next/image';
import { LinkedInIcon } from '@/components/Icons';
import { foundingIdeas, initialsOf, partners, principles, site } from '@/lib/site';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About',
  description:
    "We invest early, and we stay. Coastline Catalyst's mission, vision, and investment philosophy, and the partners behind the firm.",
  alternates: { canonical: '/about' },
  openGraph: {
    title: `About · ${site.name}`,
    description: 'We invest early, and we stay.',
    url: '/about',
  },
};

const partnerLd = partners.map((partner) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: partner.name,
  jobTitle: partner.role,
  worksFor: { '@type': 'Organization', name: site.name },
  ...(partner.linkedin.startsWith('http') ? { sameAs: [partner.linkedin] } : {}),
}));

export default function AboutPage() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(partnerLd) }}
      />

      <section className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.h1}>We invest early, and we stay.</h1>
          <div className={styles.horizon} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.label} data-reveal="0">
            What we believe
          </p>
          <h2 className={styles.h2} data-reveal="60">
            We are building this on two simple ideas
          </h2>
          <div className={styles.twoCol}>
            {foundingIdeas.map((idea, i) => (
              <div key={idea.title} data-reveal={i * 80}>
                <h3 className={styles.ideaTitle}>{idea.title}</h3>
                {idea.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className={styles.lede}>
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.label} data-reveal="0">
            Investment philosophy
          </p>
          <h2 className={styles.h2} data-reveal="60">
            How we approach early-stage investing
          </h2>
          <div>
            {principles.map((principle) => (
              <div key={principle.num} className={styles.principle} data-reveal="60">
                <span className={styles.principleNum}>{principle.num}</span>
                <div className={styles.principleBody}>
                  <h3 className={styles.principleTitle}>{principle.title}</h3>
                  <p className={styles.principleText}>{principle.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.partnersSection}>
        <div className={styles.wrap}>
          <p className={styles.label} data-reveal="0">
            Meet the partners
          </p>
          <h2 className={styles.h2} data-reveal="60">
            Two people, one long view
          </h2>
          <div className={styles.partnerGrid}>
            {partners.map((partner, i) => (
              <div key={partner.name} className={styles.partnerCard} data-reveal={i * 80}>
                {partner.photo ? (
                  <div className={styles.photo}>
                    <Image
                      src={partner.photo}
                      alt={`${partner.name}, ${partner.role} at ${site.name}`}
                      fill
                      sizes="220px"
                    />
                  </div>
                ) : (
                  /* Real headshots drop into `photo` in src/lib/site.ts. */
                  <div className={styles.photoSlot} aria-hidden="true">
                    <span className={styles.photoSlotInitials}>{initialsOf(partner.name)}</span>
                    <span className={styles.photoSlotNote}>[Headshot to be added]</span>
                  </div>
                )}
                <div>
                  <h3 className={styles.partnerName}>{partner.name}</h3>
                  <p className={styles.partnerRole}>{partner.role}</p>
                </div>
                <p className={styles.partnerBio}>{partner.bio}</p>
                <a
                  href={partner.linkedin}
                  className={styles.partnerLink}
                  aria-label={`${partner.name} on LinkedIn`}
                  target={partner.linkedin.startsWith('http') ? '_blank' : undefined}
                  rel={partner.linkedin.startsWith('http') ? 'noreferrer' : undefined}
                >
                  <LinkedInIcon />
                  LinkedIn
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
