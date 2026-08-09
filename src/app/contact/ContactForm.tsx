'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import Turnstile, { type TurnstileHandle } from '@/components/Turnstile';
import form from '@/components/forms.module.css';
import styles from './contact.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = 'name' | 'email' | 'message';

/** Plain language, and always with the fix. Never "Invalid input." */
function validate(field: FieldName, values: Record<FieldName, string>): string | null {
  switch (field) {
    case 'name': {
      const value = values.name.trim();
      if (!value) return 'Add your name so we know who is writing.';
      return value.length <= 120 ? null : 'That name is too long. Keep it under 120 characters.';
    }
    case 'email': {
      const value = values.email.trim();
      if (!value) return 'Add the email address you want us to reply to.';
      return EMAIL_RE.test(value)
        ? null
        : 'That email looks incomplete. Check for a typo, e.g. name@company.com.';
    }
    case 'message': {
      const value = values.message.trim();
      if (value.length < 10) return 'Tell us a little more, at least 10 characters.';
      return value.length <= 5000 ? null : 'That message is very long. Keep it under 5000 characters.';
    }
  }
}

export default function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState('');
  const turnstile = useRef<TurnstileHandle | null>(null);

  /* Blur and click handlers read this rather than their own render closure:
     autofill can fire input and blur inside one task. */
  const latest = useRef(values);
  /* Deliberately during render, not in an effect. Autofill can fire input and
     blur inside a single task, and an effect would not have run yet, so the
     blur handler would read the pre-autofill values. That is the bug this ref
     exists to fix. */
  // eslint-disable-next-line react-hooks/refs
  latest.current = values;

  const emailOk = EMAIL_RE.test(values.email.trim());
  const ready =
    Boolean(values.name.trim() && emailOk && values.message.trim().length >= 10) && Boolean(token);

  const onField = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const next = { ...latest.current, [name]: value };
    setValues(next);
    // Typing never raises an error, but it clears one that is now satisfied.
    if (errors[name as FieldName] && !validate(name as FieldName, next)) {
      setErrors((current) => {
        const copy = { ...current };
        delete copy[name as FieldName];
        return copy;
      });
    }
  };

  const onBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as FieldName;
    if (name !== 'name' && name !== 'email' && name !== 'message') return;
    // An untouched empty field should not shout at someone tabbing through.
    if (!e.target.value.trim() && name !== 'email') return;

    const message = validate(name, latest.current);
    setErrors((current) => {
      const copy = { ...current };
      if (message && e.target.value.trim()) copy[name] = message;
      else delete copy[name];
      return copy;
    });
  };

  const send = async () => {
    if (sending) return;

    const next: Partial<Record<FieldName, string>> = {};
    for (const field of ['name', 'email', 'message'] as const) {
      const message = validate(field, latest.current);
      if (message) next[field] = message;
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    if (!token) {
      setSendError('Complete the spam check below, then send.');
      return;
    }

    setSendError('');
    setSending(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...latest.current, turnstileToken: token }),
      });

      if (!response.ok) {
        const detail = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(detail?.error ?? '');
      }

      setSent(true);
    } catch (error) {
      /* Nothing typed is cleared: the values stay in state and the form stays
         mounted, so retrying costs one click. The token is single use, so it
         is reset either way. */
      turnstile.current?.reset();
      setToken('');
      setSendError(
        (error instanceof Error && error.message) ||
          'Something went wrong sending that. Try again, or email us at hello@coastlinecatalyst.com.',
      );
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.sentCard} role="status">
        <h2 className={styles.sentTitle}>Message sent.</h2>
        <p className={styles.sentBody}>
          Thanks for reaching out. We&rsquo;ll reply to your email soon.
        </p>
      </div>
    );
  }

  const errorProps = (name: FieldName) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `err-c-${name}` : undefined,
  });

  return (
    <form className={styles.form} onSubmit={(e) => e.preventDefault()} noValidate>
      <div className={form.field}>
        <label className={form.label} htmlFor="c-name">
          Name
        </label>
        <input
          id="c-name"
          name="name"
          className={form.input}
          value={values.name}
          onChange={onField}
          onBlur={onBlur}
          autoComplete="name"
          disabled={sending}
          {...errorProps('name')}
        />
        {errors.name && (
          <p id="err-c-name" role="alert" className={form.error}>
            {errors.name}
          </p>
        )}
      </div>

      <div className={form.field}>
        <label className={form.label} htmlFor="c-email">
          Email
        </label>
        <input
          id="c-email"
          name="email"
          type="email"
          className={form.input}
          value={values.email}
          onChange={onField}
          onBlur={onBlur}
          autoComplete="email"
          disabled={sending}
          {...errorProps('email')}
        />
        {errors.email && (
          <p id="err-c-email" role="alert" className={form.error}>
            {errors.email}
          </p>
        )}
      </div>

      <div className={form.field}>
        <label className={form.label} htmlFor="c-subject">
          Subject
        </label>
        <input
          id="c-subject"
          name="subject"
          className={form.input}
          value={values.subject}
          onChange={onField}
          disabled={sending}
        />
      </div>

      <div className={form.field}>
        <label className={form.label} htmlFor="c-message">
          Message
        </label>
        <textarea
          id="c-message"
          name="message"
          rows={6}
          className={form.textarea}
          value={values.message}
          onChange={onField}
          onBlur={onBlur}
          disabled={sending}
          {...errorProps('message')}
        />
        {errors.message && (
          <p id="err-c-message" role="alert" className={form.error}>
            {errors.message}
          </p>
        )}
      </div>

      <Turnstile onToken={setToken} handleRef={turnstile} />

      {sendError && (
        <p role="alert" className={styles.sendError}>
          {sendError}
        </p>
      )}

      <button
        type="button"
        className={`${form.pillButton} ${styles.submit}`}
        disabled={!ready || sending}
        onClick={send}
      >
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
