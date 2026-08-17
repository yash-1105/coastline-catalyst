import type { Metadata } from 'next';
import Image from 'next/image';
import { LinkedInIcon } from '@/components/Icons';
import WaveMotif from '@/components/WaveMotif';
import {
  beyondCapital,
  capabilities,
  corridor,
  foundingIdeas,
  howWeWork,
  initialsOf,
  partners,
  principles,
  site,
} from '@/lib/site';
import { Disclosure, Rail } from './Narrow';
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

/**
 * First sentence, then the rest. The phone shows the first and folds the rest
 * away; site.ts stays a copy file, so the split happens here. Returns null for
 * a bio that is a single sentence, which is not worth a disclosure.
 */
function splitBio(bio: string): [string, string] | null {
  const end = bio.indexOf('. ');
  return end < 0 ? null : [bio.slice(0, end + 1), bio.slice(end + 2)];
}

export default function AboutPage() {
  return (
    <main id="main">
      <script
        type="application/ld+json"

        dangerouslySetInnerHTML={{ __html: JSON.stringify(partnerLd) }}
      />

      <section className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.h1}>
            We invest early, <span className={styles.h1Accent}>and we stay.</span>
          </h1>
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
            {foundingIdeas.map((idea, i) => {
              const [lead, ...rest] = idea.paragraphs;
              return (
                <div key={idea.title} data-reveal={i * 80}>
                  <h3 className={styles.ideaTitle}>{idea.title}</h3>
                  <p className={styles.lede}>{lead}</p>
                  {rest.length > 0 ? (
                    <Disclosure hint="Read more">
                      {rest.map((paragraph) => (
                        <p key={paragraph.slice(0, 32)} className={styles.lede}>
                          {paragraph}
                        </p>
                      ))}
                    </Disclosure>
                  ) : null}
                </div>
              );
            })}
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
                <span className={styles.drawnRule} data-rule aria-hidden="true" />
                <span className={styles.principleNum} data-num>{principle.num}</span>
                <Disclosure
                  className={styles.principleBody}
                  summary={<h3 className={styles.principleTitle}>{principle.title}</h3>}
                >
                  <p className={styles.principleText}>{principle.body}</p>
                </Disclosure>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.label} data-reveal="0">
            {beyondCapital.eyebrow}
          </p>
          <h2 className={styles.h2} data-reveal="60">
            {beyondCapital.heading}
          </h2>
          <p className={styles.sectionLede} data-reveal="60">
            {beyondCapital.body}
          </p>
          <Rail className={styles.capabilityGrid} label={beyondCapital.eyebrow}>
            {capabilities.map((item, i) => (
              <div key={item.title} className={styles.capability} data-reveal={i * 60}>
                <span className={styles.drawnRule} data-rule aria-hidden="true" />
                <h3 className={styles.capabilityTitle}>{item.title}</h3>
                <p className={styles.capabilityBody}>{item.body}</p>
              </div>
            ))}
          </Rail>
        </div>
      </section>

      <section className={styles.corridor}>
        <WaveMotif height={150} opacity={0.07} />
        <div className={styles.corridorInner}>
          <p className={styles.corridorEyebrow} data-reveal="0">
            {corridor.eyebrow}
          </p>
          <h2 className={styles.corridorHeading} data-reveal="60">
            {corridor.heading}
          </h2>
          <div className={styles.corridorBody} data-reveal="120">
            {corridor.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.wrap}>
          <p className={styles.label} data-reveal="0">
            {howWeWork.eyebrow}
          </p>
          <h2 className={styles.h2} data-reveal="60">
            {howWeWork.heading}
          </h2>
          <p className={styles.sectionLede} data-reveal="60">
            {howWeWork.body}
          </p>
          <ol className={styles.steps}>
            {howWeWork.steps.map((step, i) => (
              <li key={step.title} className={styles.step} data-reveal={i * 70}>
                <span className={styles.drawnRule} data-rule aria-hidden="true" />
                <span className={styles.stepNum} data-num>{`0${i + 1}`}</span>
                <Disclosure
                  className={styles.stepGroup}
                  summary={<h3 className={styles.stepTitle}>{step.title}</h3>}
                >
                  <p className={styles.stepBody}>{step.body}</p>
                </Disclosure>
              </li>
            ))}
          </ol>
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
            {partners.map((partner, i) => {
              const bio = splitBio(partner.bio);
              return (
                <div key={partner.name} className={styles.partnerCard} data-reveal={i * 80}>
                  {/* Photo and name are one group so the phone can stand them side
                      by side. The group repeats the card's own column gap, which
                      is what leaves the desktop card exactly as it was. */}
                  <div className={styles.partnerHead}>
                    {partner.photo ? (
                      <div className={styles.photo} data-warm>
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
                        <span className={styles.photoSlotInitials}>
                          {initialsOf(partner.name)}
                        </span>
                        <span className={styles.photoSlotNote}>[Headshot to be added]</span>
                      </div>
                    )}
                    <div>
                      <h3 className={styles.partnerName}>{partner.name}</h3>
                      <p className={styles.partnerRole}>{partner.role}</p>
                    </div>
                  </div>
                  {bio ? (
                    <Disclosure
                      className={styles.partnerBioWrap}
                      summary={<span className={styles.partnerBio}>{bio[0]}</span>}
                      hint="Read more"
                      wide={<p className={styles.partnerBio}>{partner.bio}</p>}
                    >
                      <p className={styles.partnerBio}>{bio[1]}</p>
                    </Disclosure>
                  ) : (
                    <p className={styles.partnerBio}>{partner.bio}</p>
                  )}
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
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
