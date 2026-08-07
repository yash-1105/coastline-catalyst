'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './ScrollVideo.module.css';

export type ScrollVideoMode = 'pinned' | 'inline';

/** How the footage is driven. */
export type ScrollVideoPlayback =
  /** Frame position follows scroll position. */
  | 'scrub'
  /** Plays and loops on its own while on screen. */
  | 'loop';

export interface ScrollVideoProps {
  src: string;
  poster: string;
  mode: ScrollVideoMode;
  playback?: ScrollVideoPlayback;
  /** pinned mode only */
  pinHeight?: string;
  /** hero only: preload the file and attach src immediately */
  eager?: boolean;
  className?: string;
  /** Applied to the layer holding both poster and video: opacity, blend mode. */
  mediaClassName?: string;
  /**
   * Sets `document.documentElement.dataset[<name>]` while the media is on
   * screen. The header and scroll spine key their over-video theme off this,
   * so the handoff follows the real element rather than a scroll offset.
   */
  documentFlag?: string;
  children?: ReactNode;
}

/** Interpolation factor toward the scroll target, per animation frame.
 *  Assigning currentTime straight from a scroll handler reads mechanical;
 *  easing toward it is what makes the scrub feel cinematic. Tune, do not
 *  remove. Higher is snappier, lower is looser. */
const SMOOTHING = 0.12;

/** Seeking to the exact final frame renders black in some browsers, so the
 *  target never quite reaches the end. */
const END_GUARD = 0.05;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export default function ScrollVideo({
  src,
  poster,
  mode,
  playback = 'scrub',
  pinHeight = '250vh',
  eager = false,
  className,
  mediaClassName,
  documentFlag,
  children,
}: ScrollVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Scrubbing needs a pointer-class device: below 900px iOS Safari does not
     honour programmatic currentTime reliably enough to risk a frozen section.
     Both start false so the server renders the poster. */
  const [allowMotion, setAllowMotion] = useState(false);
  const [allowScrub, setAllowScrub] = useState(false);
  const [sourceAttached, setSourceAttached] = useState(eager);

  /* Below 900px a scrub section falls back to looping rather than to a still
     poster. Muted, playsInline autoplay is well supported on iOS, so the
     footage still moves on the phones most of this traffic arrives on; it just
     runs on its own clock instead of following the scroll. Only reduced motion
     drops to a static poster now. */
  const scrubbing = playback === 'scrub' && allowScrub;
  const looping = allowMotion && !scrubbing;
  const active = scrubbing || looping;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 900px)');
    const sync = () => {
      setAllowMotion(!reduced.matches);
      setAllowScrub(!reduced.matches && wide.matches);
    };

    sync();
    reduced.addEventListener('change', sync);
    wide.addEventListener('change', sync);
    return () => {
      reduced.removeEventListener('change', sync);
      wide.removeEventListener('change', sync);
    };
  }, []);

  // Attach src well before the section arrives, so it is decodable on entry.
  useEffect(() => {
    if (sourceAttached || !active) return;
    const root = rootRef.current;
    if (!root) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSourceAttached(true);
          io.disconnect();
        }
      },
      { rootMargin: '200% 0px' },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [sourceAttached, active]);

  /* Setting src and preload is not always enough on its own: an element that
     first rendered with preload="none" may sit idle until told to load. */
  useEffect(() => {
    if (!sourceAttached || !active) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState === 0 && video.networkState !== 2) video.load();
  }, [sourceAttached, active]);

  // Publish visibility for the page theme, whether or not video is running.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !documentFlag) return;

    const target = mode === 'pinned' ? root.firstElementChild ?? root : root;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) document.documentElement.dataset[documentFlag] = 'true';
          else delete document.documentElement.dataset[documentFlag];
        }
      },
      { threshold: 0 },
    );
    io.observe(target);

    return () => {
      io.disconnect();
      delete document.documentElement.dataset[documentFlag];
    };
  }, [documentFlag, mode]);

  // ---- loop playback: play while on screen, pause when it leaves ----
  useEffect(() => {
    if (!looping) return;
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          const started = video.play();
          if (started && typeof started.catch === 'function') {
            started.catch(() => undefined);
          }
        } else {
          video.pause();
        }
      },
      { threshold: 0 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      video.pause();
    };
  }, [looping, sourceAttached]);

  // ---- scrub playback ----
  useEffect(() => {
    if (!scrubbing) return;
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;

    let frame = 0;
    let running = false;
    let ready = false;
    let current = 0;
    let target = 0;

    const readProgress = () => {
      const rect = root.getBoundingClientRect();
      const viewport = window.innerHeight;

      if (mode === 'pinned') {
        const travel = root.offsetHeight - viewport;
        return travel > 0 ? clamp01(-rect.top / travel) : 0;
      }
      // inline: from the top edge entering the bottom of the screen to the
      // bottom edge leaving the top. No pinning, no added scroll length.
      const travel = viewport + rect.height;
      return travel > 0 ? clamp01((viewport - rect.top) / travel) : 0;
    };

    const tick = () => {
      const progress = readProgress();
      root.style.setProperty('--p', progress.toFixed(4));

      if (ready && video.duration > 0) {
        target = Math.min(progress * video.duration, video.duration - END_GUARD);
        current += (target - current) * SMOOTHING;
        if (Math.abs(target - current) < 0.001) current = target;
        video.currentTime = current;
      }

      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(frame);
    };

    const onMeta = () => {
      ready = true;
      current = video.currentTime;
      /* iOS Safari ignores the first several currentTime assignments unless
         the element has actually played once. Muted + playsInline means
         autoplay is permitted, so warm the decoder and immediately stop. */
      const warm = video.play();
      if (warm && typeof warm.then === 'function') {
        warm.then(() => video.pause()).catch(() => undefined);
      } else {
        video.pause();
      }
    };

    if (video.readyState >= 1) onMeta();
    else video.addEventListener('loadedmetadata', onMeta);

    // Idle rAF loops on off-screen sections show up on low-end Android.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(root);

    return () => {
      io.disconnect();
      stop();
      video.removeEventListener('loadedmetadata', onMeta);
    };
  }, [scrubbing, mode, sourceAttached]);

  const media = (
    <div className={`${styles.mediaLayer} ${mediaClassName ?? ''}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={styles.poster}
        src={poster}
        alt=""
        aria-hidden="true"
        fetchPriority={eager ? 'high' : 'low'}
        decoding={eager ? 'sync' : 'async'}
        loading={eager ? 'eager' : 'lazy'}
      />
      {active && (
        <video
          ref={videoRef}
          className={styles.media}
          src={sourceAttached ? src : undefined}
          poster={poster}
          /* Must become 'auto' the moment a src exists. Left at 'none' the
             browser fetches nothing, metadata never arrives, and the poster
             is all that ever shows. */
          preload={sourceAttached ? 'auto' : 'none'}
          muted
          playsInline
          loop={looping}
          autoPlay={looping}
          disablePictureInPicture
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );

  if (mode === 'pinned') {
    return (
      <div
        ref={rootRef}
        className={`${styles.root} ${className ?? ''}`}
        /* Reduced motion and small screens lose the pin entirely. */
        style={{ height: scrubbing ? pinHeight : '100vh' }}
      >
        <div className={styles.sticky}>
          {media}
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`${styles.root} ${className ?? ''}`}>
      {media}
      <div className={styles.inlineContent}>{children}</div>
    </div>
  );
}
