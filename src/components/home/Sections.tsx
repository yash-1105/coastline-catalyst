import { BeliefIcon } from '@/components/Icons';
import ScrollVideo from '@/components/ScrollVideo';
import { believe, focus, lookFor, whoWeAre, whyPartner } from '@/lib/site';
import styles from './Home.module.css';

/* ---------- 01 / 07 ---------- */

export function WhoWeAre() {
  return (
    <section className={styles.who} data-sec>
      <div className={styles.whoWrap}>
        <span aria-hidden="true" className={styles.whoIndex}>
          01 / 07
        </span>
        <div className={styles.whoInner}>
          <p className={styles.whoEyebrow} data-reveal="0">
            Who we are
          </p>
          {/* Split server side so the fill effect never rewrites the DOM. */}
          <p className={styles.whoText} data-who>
            {whoWeAre.split(' ').map((word, i) => (
              <span key={`${word}-${i}`} data-who-word>
                {word}
                {i < whoWeAre.split(' ').length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 02 / 07 ---------- */

export function WhatWeBelieve() {
  return (
    <section className={styles.believe} data-sec>
      <div className={styles.believeGrid}>
        <div className={styles.believeSticky}>
          <p className={styles.believeEyebrow}>What we believe</p>
          <span aria-hidden="true" className={styles.index}>
            02 / 07
          </span>
        </div>
        <div className={`${styles.believeTrack} cc-noscrollbar`}>
          {believe.map((item, i) => (
            <div key={item.title} className={styles.believeItem} data-reveal={i * 80}>
              <BeliefIcon name={item.icon} />
              <h3 className={styles.believeTitle}>{item.title}</h3>
              <p className={styles.believeBody}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 03 / 07 ---------- */

export function InvestmentFocus() {
  return (
    <section className={styles.focus} data-sec>
      {/* Scroll-linked, not pinned: the band keeps its natural height so the
          four values stay readable while stationary. The SVG wave curves are
          gone, redundant now that real water runs behind the band. */}
      <ScrollVideo
        mode="inline"
        src="/video/tide-edge.mp4"
        srcMobile="/video/tide-edge.mobile.mp4"
        poster="/video/posters/tide-edge.webp"
        mediaClassName={styles.focusMedia}
      >
        <div className={styles.focusInner}>
          <div className={styles.focusHead}>
            <p className={styles.focusEyebrow}>Investment focus</p>
            <span aria-hidden="true" className={styles.focusIndex}>
              03 / 07
            </span>
          </div>
          <div className={styles.focusGrid}>
            {focus.map((item) => (
              <div key={item.label} className={styles.focusItem} data-focus-item>
                <div className={styles.focusLine} data-focus-line />
                <p className={styles.focusLabel}>{item.label}</p>
                <div className={styles.focusValueMask}>
                  <p className={styles.focusValue} data-focus-value>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollVideo>
    </section>
  );
}

/* ---------- 04 / 07 ---------- */

export function WhatWeLookFor() {
  return (
    <section className={styles.lookFor} data-sec>
      <div className={styles.splitGrid}>
        <div className={styles.stickyCol}>
          <p className={styles.eyebrow}>What we look for</p>
          <h2 className={styles.headline16}>Are we a fit for what you&rsquo;re building?</h2>
          <span aria-hidden="true" className={styles.index}>
            04 / 07
          </span>
        </div>
        <div className={styles.lookForList}>
          {lookFor.map((item, i) => (
            <div key={item.title} className={styles.lookForItem} data-reveal={i * 80}>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemBody}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- 06 / 07 ---------- */

export function WhyPartner() {
  return (
    <section className={styles.why} data-sec>
      <div className={styles.splitGrid}>
        <div className={styles.stickyCol}>
          <p className={styles.eyebrow}>The partnership</p>
          <h2 className={styles.headline14}>Why founders partner with us</h2>
          <span aria-hidden="true" className={styles.index}>
            06 / 07
          </span>
        </div>
        <div>
          {whyPartner.map((item, i) => (
            <div key={item.title} className={styles.whyRow} data-wrow data-reveal={i * 90}>
              <span className={styles.whyNum} data-wnum>
                {`0${i + 1}`}
              </span>
              <div className={styles.whyBody}>
                <h3 className={styles.whyTitle}>{item.title}</h3>
                <p className={styles.whyText}>{item.body}</p>
              </div>
              <div className={styles.whyLine} data-wline />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
