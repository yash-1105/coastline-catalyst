import Link from 'next/link';
import ScrollVideo from '@/components/ScrollVideo';
import styles from './Hero.module.css';

/**
 * "Investing in founders building the next generation of businesses."
 * Revealed word by word from behind masks: 650ms each, 55ms stagger,
 * starting at 200ms. The whole opening sequence lands inside 2.2s.
 */
const HEADLINE = [
  ['Investing', 'in', 'founders'],
  ['building', 'the', 'next'],
  ['generation', 'of', 'businesses.'],
];

export default function Hero() {
  let wordIndex = -1;

  return (
    <section className={styles.hero} data-sec>
      <ScrollVideo
        mode="pinned"
        src="/video/hero-coastline.mp4"
        poster="/video/posters/hero-coastline.webp"
        pinHeight="250vh"
        eager
        documentFlag="heroVideo"
        className={styles.stage}
      >
        {/* Navy scrim, heavier on the left where the copy sits. Eases back
            once --p passes 0.5 and the copy has gone, opening the footage. */}
        <div className={styles.scrim} aria-hidden="true" />

        <div className={styles.inner}>
          <div className={styles.head}>
            <p className={styles.eyebrow}>Early-stage investment · India × GCC</p>

            <h1 className={styles.h1}>
              {HEADLINE.map((line, li) => (
                <span key={li} className={styles.line}>
                  {line.map((word) => {
                    wordIndex += 1;
                    return (
                      <span key={word + wordIndex} className={styles.mask}>
                        <span
                          className={styles.word}
                          style={{ animationDelay: `${(0.2 + wordIndex * 0.055).toFixed(3)}s` }}
                        >
                          {word}
                        </span>
                      </span>
                    );
                  })}
                </span>
              ))}
            </h1>

            {/* The horizon line: full content width, drawn left to right. */}
            <div className={styles.horizon} />

            <p className={styles.sub}>
              Coastline Catalyst is an early-stage investment firm partnering with ambitious
              founders across India, with a long-term vision of connecting innovation between
              India and the GCC.
            </p>

            <div className={styles.actions}>
              <Link href="/submit-pitch" className={styles.primary}>
                Submit pitch deck
              </Link>
              <Link href="/about" className={styles.ghost}>
                Meet us
              </Link>
            </div>
          </div>

          <div className={styles.cue} data-cue>
            <span className={styles.cueTrack}>
              <span className={styles.cueDot} />
            </span>
            <span className={styles.cueLabel}>Scroll</span>
          </div>
        </div>
      </ScrollVideo>
    </section>
  );
}
