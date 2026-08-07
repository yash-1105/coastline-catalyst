'use client';

import { useState, type ChangeEvent } from 'react';
import form from '@/components/forms.module.css';
import styles from './contact.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', subject: '', message: '' });
  const [emailError, setEmailError] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const emailOk = EMAIL_RE.test(values.email.trim());
  const ready = Boolean(values.name.trim() && emailOk && values.message.trim());

  const onField = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (name === 'email') setEmailError('');
  };

  const send = async () => {
    if (!ready || sending) return;

    setSendError('');
    setSending(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error ?? '');
      }

      setSent(true);
    } catch (error) {
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
          autoComplete="name"
        />
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
          /* Read the field itself, not the render closure: autofill can fire
             input and blur inside one task and leave the closure stale. */
          onBlur={(e) => {
            const value = e.target.value.trim();
            if (value && !EMAIL_RE.test(value)) {
              setEmailError(
                'That email looks incomplete. Check for a typo, e.g. name@company.com.',
              );
            }
          }}
          autoComplete="email"
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? 'err-c-email' : undefined}
        />
        {emailError && (
          <p id="err-c-email" role="alert" className={form.error}>
            {emailError}
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
        />
      </div>

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
