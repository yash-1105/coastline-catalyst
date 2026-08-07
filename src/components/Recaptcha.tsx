'use client';

import { useEffect, useId, useRef } from 'react';
import styles from './forms.module.css';

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void },
      ) => number;
    };
    ccRecaptchaReady?: () => void;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

/**
 * reCAPTCHA v2 slot. With NEXT_PUBLIC_RECAPTCHA_SITE_KEY unset this renders
 * the placeholder box from the design and the API route skips verification.
 */
export default function Recaptcha({ onToken }: { onToken: (token: string) => void }) {
  const holder = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const callback = useRef(onToken);
  callback.current = onToken;
  const id = useId();

  useEffect(() => {
    if (!SITE_KEY || !holder.current) return;

    const render = () => {
      if (rendered.current || !holder.current || !window.grecaptcha) return;
      rendered.current = true;
      window.grecaptcha.render(holder.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => callback.current(token),
        'expired-callback': () => callback.current(''),
      });
    };

    if (window.grecaptcha) {
      render();
      return;
    }

    window.ccRecaptchaReady = render;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=ccRecaptchaReady&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  if (!SITE_KEY) {
    return <div className={styles.captcha}>reCAPTCHA verification loads here.</div>;
  }

  return <div ref={holder} id={id} className={styles.captchaLive} />;
}
