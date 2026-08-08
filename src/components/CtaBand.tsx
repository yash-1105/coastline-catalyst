import Link from 'next/link';
import ScrollVideo from './ScrollVideo';
import WaveMotif from './WaveMotif';
import { ctaBand } from '@/lib/site';
import styles from './CtaBand.module.css';

/**
 * The closing navy band shared by Home and About.
 *
 * `video` is opt-in because this component is shared: only Home's instance
 * carries the open-water clip and drops the SVG wave curves. About keeps the
 * band exactly as it was.
 */
export default function CtaBand({ video = false }: { video?: boolean }) {
  const body = (
    <div className={styles.inner}>
      <h2 className={styles.heading} data-reveal="0">
        {ctaBand.heading}
      </h2>
      <p className={styles.body} data-reveal="80">
        {ctaBand.body}
      </p>
      <div className={styles.actions} data-reveal="160">
        <Link href={ctaBand.primary.href} className={styles.primary}>
          {ctaBand.primary.label}
        </Link>
        <Link href={ctaBand.secondary.href} className={styles.ghost}>
          {ctaBand.secondary.label}
        </Link>
      </div>
    </div>
  );

  if (!video) {
    return (
      <section className={styles.band} data-sec>
        <WaveMotif height={160} opacity={0.1} />
        {body}
      </section>
    );
  }

  return (
    <section className={styles.band} data-sec>
      {/* Inline, never pinned. This is the conversion moment, so the section
          keeps its natural height: making someone scroll further to reach
          "Submit pitch deck" would cost more than the video gains.
          The water plays and loops on its own here rather than following
          scroll, so the band still moves once the reader has stopped. */}
      <ScrollVideo
        mode="inline"
        playback="loop"
        src="/video/open-water.mp4"
        srcMobile="/video/open-water.mobile.mp4"
        poster="/video/posters/open-water.webp"
        mediaClassName={styles.media}
      >
        {/* The clip is already close to the band's own navy, so plain opacity
            reads better than a blend mode. This scrim protects the headline
            and both buttons. */}
        <div className={styles.videoScrim} aria-hidden="true" />
        {body}
      </ScrollVideo>
    </section>
  );
}
