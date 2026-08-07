'use client';

import { useCallback, useEffect, useRef } from 'react';
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
  'error-callback': () => void;
  'timeout-callback': () => void;
  theme?: 'light' | 'dark' | 'auto';
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
  callback.current = onToken;

  const reset = useCallback(() => {
    callback.current('');
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
        callback: (token: string) => callback.current(token),
        // A stale token is worse than no token: the server would reject it.
        'expired-callback': () => reset(),
        'error-callback': () => callback.current(''),
        'timeout-callback': () => reset(),
        theme: 'light',
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

  return <div ref={holder} className={styles.captchaLive} />;
}
