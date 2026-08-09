'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './forms.module.css';

/**
 * Cloudflare Turnstile.
 *
 * Renders explicitly rather than via auto-discovery so the widget can be reset
 * on demand. Tokens expire after a few minutes, and a founder filling in three
 * steps with a 25MB deck can easily outlast one. On expiry we clear the token
 * and reset the widget rather than letting the submission fail.
 *
 * With NEXT_PUBLIC_TURNSTILE_SITE_KEY unset this renders a placeholder and
 * reports no token. The server still rejects tokenless submissions, so an
 * unconfigured deploy fails closed.
 */

type TurnstileOptions = {
  sitekey: string;
  callback: (token: string) => void;
  'expired-callback': () => void;
  /** Cloudflare passes a numeric error code as a string, e.g. "110200". */
  'error-callback': (code: string) => void;
  'timeout-callback': () => void;
  theme?: 'light' | 'dark' | 'auto';
  /** Let the widget recover from transient network failures on its own. */
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
    ccTurnstileReady?: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_ID = 'cf-turnstile-script';

export type TurnstileHandle = { reset: () => void };

export default function Turnstile({
  onToken,
  handleRef,
}: {
  onToken: (token: string) => void;
  /** Lets the form reset the widget after a failed submission. */
  handleRef?: React.RefObject<TurnstileHandle | null>;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const callback = useRef(onToken);
  const [errorCode, setErrorCode] = useState('');

  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);

  const reset = useCallback(() => {
    callback.current('');
    setErrorCode('');
    if (window.turnstile && widgetId.current) window.turnstile.reset(widgetId.current);
  }, []);

  useEffect(() => {
    if (handleRef) handleRef.current = { reset };
  }, [handleRef, reset]);

  useEffect(() => {
    if (!SITE_KEY || !holder.current) return;

    const render = () => {
      if (widgetId.current !== null || !holder.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(holder.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => {
          setErrorCode('');
          callback.current(token);
        },
        // A stale token is worse than no token: the server would reject it.
        'expired-callback': () => reset(),
        /* Surface the code rather than swallowing it. A silent dead widget is
           the worst outcome here: the visitor cannot submit and nobody can
           tell why. 110200 is an unlisted hostname, the 300/600 range is a
           challenge failure that a retry usually clears. */
        'error-callback': (code: string) => {
          setErrorCode(String(code || 'unknown'));
          callback.current('');
        },
        /* Not a silent reset. Resetting on timeout puts the widget straight
           back into its spinner, so a challenge that keeps timing out spins
           forever and the visitor is left staring at a dead form with nothing
           to act on. Say so instead, and offer the retry. */
        'timeout-callback': () => {
          setErrorCode('timeout');
          callback.current('');
        },
        theme: 'light',
        retry: 'auto',
        'retry-interval': 3000,
        'refresh-expired': 'auto',
      });
    };

    if (window.turnstile) {
      render();
      return;
    }

    window.ccTurnstileReady = render;

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=ccTurnstileReady&render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, [reset]);

  if (!SITE_KEY) {
    return <div className={styles.captcha}>Spam check loads here once Turnstile is configured.</div>;
  }

  return (
    <div>
      <div ref={holder} className={styles.captchaLive} />
      {errorCode ? (
        <p className={styles.captchaError}>
          {errorCode === 'timeout'
            ? 'The spam check timed out.'
            : `The spam check could not load (code ${errorCode}).`}{' '}
          <button type="button" className={styles.captchaRetry} onClick={reset}>
            Try again
          </button>{' '}
          or email us at hello@coastlinecatalyst.com.
        </p>
      ) : null}
    </div>
  );
}
