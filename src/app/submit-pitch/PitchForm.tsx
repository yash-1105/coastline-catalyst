'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from 'react';
import Recaptcha from '@/components/Recaptcha';
import { PdfIcon } from '@/components/Icons';
import { revenueOptions, stageOptions } from '@/lib/site';
import form from '@/components/forms.module.css';
import styles from './submit-pitch.module.css';

const MAX_BYTES = 25 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Values = {
  company: string;
  founder: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  stage: string;
  revenue: string;
  industry: string;
  country: string;
  desc: string;
  why: string;
  notes: string;
  consent: boolean;
};

type FieldName = keyof Values | 'file';

const EMPTY: Values = {
  company: '',
  founder: '',
  email: '',
  phone: '',
  website: '',
  linkedin: '',
  stage: '',
  revenue: '',
  industry: '',
  country: '',
  desc: '',
  why: '',
  notes: '',
  consent: false,
};

const STEP_FIELDS: FieldName[][] = [
  ['company', 'founder', 'email'],
  ['stage', 'industry', 'country', 'desc'],
  ['why', 'file', 'consent'],
];

const STEP_LABELS = ['1 · About you', '2 · About the business', '3 · Fit and materials'];

/** Plain-language messages. Every one of these is final copy. */
function validate(field: FieldName, values: Values, file: File | null): string | null {
  switch (field) {
    case 'company':
      return values.company.trim() ? null : 'Add your company name so we know who is applying.';
    case 'founder':
      return values.founder.trim() ? null : 'Add your name so we know who to reply to.';
    case 'email':
      if (!values.email.trim()) return 'Add the email address you want us to reply to.';
      return EMAIL_RE.test(values.email.trim())
        ? null
        : 'That email looks incomplete. Check for a typo, e.g. name@company.com.';
    case 'stage':
      return values.stage ? null : 'Pick the stage that fits best. An honest guess is fine.';
    case 'industry':
      return values.industry.trim() ? null : 'Tell us the industry you operate in.';
    case 'country':
      return values.country.trim() ? null : 'Tell us where the business is based.';
    case 'desc':
      return values.desc.trim().length >= 40
        ? null
        : 'Give us at least a couple of sentences, 40 characters or more.';
    case 'why':
      return values.why.trim() ? null : 'A line or two is enough. Why us, specifically?';
    case 'file':
      return file ? null : 'Attach your pitch deck as a single PDF so we can review it.';
    case 'consent':
      return values.consent
        ? null
        : 'Tick the box so we have your permission to store and review this.';
    default:
      return null;
  }
}

export default function PitchForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  /* Keep the sliding viewport exactly as tall as the step on show, and
     re-measure when its content grows (an error appears, a textarea is
     dragged taller, the deck row replaces the drop zone). */
  useEffect(() => {
    const panel = panels.current[step];
    const box = viewport.current;
    if (!panel || !box) return;

    const measure = () => {
      box.style.height = `${panel.offsetHeight}px`;
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [step]);

  /* Blur and click handlers validate against this rather than their own render
     closure: autofill can fire input and blur inside one task, which would
     otherwise raise an error against the previous value. */
  const latest = useRef({ values, file });
  latest.current = { values, file };

  const stepPasses = (index: number) =>
    STEP_FIELDS[index].every((field) => !validate(field, values, file));
  const allPass = [0, 1, 2].every(stepPasses);

  /* Typing never raises an error, but it clears one the moment the field
     becomes valid. Errors are raised on blur. */
  const setValue = (name: keyof Values, value: string | boolean) => {
    const next = { ...values, [name]: value } as Values;
    setValues(next);
    if (errors[name] && !validate(name, next, file)) {
      setErrors((current) => {
        const copy = { ...current };
        delete copy[name];
        return copy;
      });
    }
  };

  const onField = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setValue(e.target.name as keyof Values, e.target.value);

  const onBlurField = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const name = e.target.name as FieldName;
    const message = validate(name, latest.current.values, latest.current.file);
    setErrors((current) => {
      const copy = { ...current };
      if (message) copy[name] = message;
      else delete copy[name];
      return copy;
    });
  };

  const checkStep = (index: number) => {
    const next = { ...errors };
    let ok = true;
    for (const field of STEP_FIELDS[index]) {
      const message = validate(field, latest.current.values, latest.current.file);
      if (message) {
        next[field] = message;
        ok = false;
      } else {
        delete next[field];
      }
    }
    setErrors(next);
    return ok;
  };

  const acceptFile = (candidate: File | null | undefined) => {
    if (!candidate) return;

    if (candidate.type !== 'application/pdf' && !/\.pdf$/i.test(candidate.name)) {
      setErrors((current) => ({
        ...current,
        file: 'That file is not a PDF. Export your deck as a PDF and try again.',
      }));
      return;
    }

    if (candidate.size > MAX_BYTES) {
      setErrors((current) => ({
        ...current,
        file: 'That file is over 25MB. Compress the PDF and try again.',
      }));
      return;
    }

    setFile(candidate);
    setErrors((current) => {
      const copy = { ...current };
      delete copy.file;
      return copy;
    });
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const onZoneKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.current?.click();
    }
  };

  const goNext = () => {
    if (!checkStep(step)) return;
    setStep((current) => Math.min(2, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    if (submitting || !checkStep(2)) return;

    setSubmitError('');
    setSubmitting(true);

    try {
      const payload = new FormData();
      for (const [key, value] of Object.entries(values)) {
        payload.append(key, String(value));
      }
      if (file) payload.append('deck', file, file.name);
      if (captchaToken) payload.append('recaptchaToken', captchaToken);

      const response = await fetch('/api/submit-pitch', { method: 'POST', body: payload });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error ?? 'Submission failed');
      }

      router.push('/thank-you');
    } catch (error) {
      setSubmitting(false);
      setSubmitError(
        error instanceof Error && error.message !== 'Submission failed'
          ? error.message
          : `Something went wrong sending that. Try again, or email your deck to hello@coastlinecatalyst.com.`,
      );
    }
  };

  const errorProps = (name: FieldName) => ({
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `err-${name}` : undefined,
  });

  const ErrorText = ({ name }: { name: FieldName }) =>
    errors[name] ? (
      <p id={`err-${name}`} role="alert" className={form.error}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <section className={styles.body}>
      <div className={styles.wrap}>
        <div className={styles.stepRow}>
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={styles.stepButton}
              data-active={i === step}
              data-clickable={i < step}
              aria-current={i === step ? 'step' : undefined}
              onClick={() => {
                if (i < step) setStep(i);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        <form onSubmit={(e) => e.preventDefault()} noValidate>
          <div ref={viewport} className={styles.viewport}>
            <div className={styles.track} style={{ transform: `translateX(-${step * 100}%)` }}>
              {/* ---------- Step 1: About you ---------- */}
              <div
                ref={(el) => {
                  panels.current[0] = el;
                }}
                className={styles.panel}
                data-active={step === 0}
                aria-hidden={step !== 0}
                aria-label="About you"
              >
                <div className={styles.pairGrid}>
                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-company">
                      Company name *
                    </label>
                    <input
                      id="f-company"
                      name="company"
                      className={form.input}
                      value={values.company}
                      onChange={onField}
                      onBlur={onBlurField}
                      autoComplete="organization"
                      {...errorProps('company')}
                    />
                    <ErrorText name="company" />
                  </div>

                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-founder">
                      Founder name *
                    </label>
                    <input
                      id="f-founder"
                      name="founder"
                      className={form.input}
                      value={values.founder}
                      onChange={onField}
                      onBlur={onBlurField}
                      autoComplete="name"
                      {...errorProps('founder')}
                    />
                    <ErrorText name="founder" />
                  </div>

                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-email">
                      Email *
                    </label>
                    <input
                      id="f-email"
                      name="email"
                      type="email"
                      className={form.input}
                      value={values.email}
                      onChange={onField}
                      onBlur={onBlurField}
                      autoComplete="email"
                      {...errorProps('email')}
                    />
                    <ErrorText name="email" />
                  </div>

                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-phone">
                      Phone
                    </label>
                    <input
                      id="f-phone"
                      name="phone"
                      type="tel"
                      className={form.input}
                      value={values.phone}
                      onChange={onField}
                      autoComplete="tel"
                    />
                  </div>

                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-website">
                      Website
                    </label>
                    <input
                      id="f-website"
                      name="website"
                      className={form.input}
                      value={values.website}
                      onChange={onField}
                      autoComplete="url"
                    />
                  </div>

                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-linkedin">
                      LinkedIn
                    </label>
                    <input
                      id="f-linkedin"
                      name="linkedin"
                      className={form.input}
                      value={values.linkedin}
                      onChange={onField}
                    />
                  </div>
                </div>
              </div>

              {/* ---------- Step 2: About the business ---------- */}
              <div
                ref={(el) => {
                  panels.current[1] = el;
                }}
                className={styles.panel}
                data-active={step === 1}
                aria-hidden={step !== 1}
                aria-label="About the business"
              >
                <div className={styles.pairGrid}>
                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-stage">
                      Stage *
                    </label>
                    <select
                      id="f-stage"
                      name="stage"
                      className={form.select}
                      value={values.stage}
                      onChange={onField}
                      onBlur={onBlurField}
                      {...errorProps('stage')}
                    >
                      <option value="">Select a stage</option>
                      {stageOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                    <ErrorText name="stage" />
                  </div>

                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-revenue">
                      Current revenue
                    </label>
                    <select
                      id="f-revenue"
                      name="revenue"
                      className={form.select}
                      value={values.revenue}
                      onChange={onField}
                    >
                      <option value="">Select a range</option>
                      {revenueOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-industry">
                      Industry *
                    </label>
                    <input
                      id="f-industry"
                      name="industry"
                      className={form.input}
                      value={values.industry}
                      onChange={onField}
                      onBlur={onBlurField}
                      {...errorProps('industry')}
                    />
                    <ErrorText name="industry" />
                  </div>

                  <div className={form.field}>
                    <label className={form.label} htmlFor="f-country">
                      Country *
                    </label>
                    <input
                      id="f-country"
                      name="country"
                      className={form.input}
                      value={values.country}
                      onChange={onField}
                      onBlur={onBlurField}
                      autoComplete="country-name"
                      {...errorProps('country')}
                    />
                    <ErrorText name="country" />
                  </div>
                </div>

                <div className={form.field}>
                  <div className={form.fieldHead}>
                    <label className={form.label} htmlFor="f-desc">
                      Short description of the business *
                    </label>
                    <span className={form.counter}>{values.desc.length}/500</span>
                  </div>
                  <textarea
                    id="f-desc"
                    name="desc"
                    rows={5}
                    maxLength={500}
                    className={form.textarea}
                    value={values.desc}
                    onChange={onField}
                    onBlur={onBlurField}
                    {...errorProps('desc')}
                  />
                  <ErrorText name="desc" />
                </div>
              </div>

              {/* ---------- Step 3: Fit and materials ---------- */}
              <div
                ref={(el) => {
                  panels.current[2] = el;
                }}
                className={styles.panel}
                data-active={step === 2}
                aria-hidden={step !== 2}
                aria-label="Fit and materials"
              >
                <div className={form.field}>
                  <label className={form.label} htmlFor="f-why">
                    Why Coastline? *
                  </label>
                  <textarea
                    id="f-why"
                    name="why"
                    rows={4}
                    className={form.textarea}
                    value={values.why}
                    onChange={onField}
                    onBlur={onBlurField}
                    {...errorProps('why')}
                  />
                  <ErrorText name="why" />
                </div>

                <div>
                  <span className={styles.zoneLabel} id="deck-label">
                    Pitch deck (PDF only, max 25MB) *
                  </span>

                  {!file ? (
                    <div
                      role="button"
                      tabIndex={0}
                      className={styles.zone}
                      data-dragging={dragging}
                      data-invalid={Boolean(errors.file)}
                      aria-labelledby="deck-label"
                      aria-describedby={errors.file ? 'err-file' : undefined}
                      onClick={() => fileInput.current?.click()}
                      onKeyDown={onZoneKey}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={onDrop}
                    >
                      <p className={styles.zoneTitle}>Drag your deck here, or click to browse</p>
                      <p className={styles.zoneHint}>One PDF, up to 25MB</p>
                    </div>
                  ) : (
                    <div className={styles.fileRow}>
                      <PdfIcon />
                      <div className={styles.fileMeta}>
                        <p className={styles.fileName}>{file.name}</p>
                        <p className={styles.fileSize}>
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        className={styles.fileRemove}
                        onClick={() => {
                          setFile(null);
                          if (fileInput.current) fileInput.current.value = '';
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInput}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                  />
                  <ErrorText name="file" />
                </div>

                <div className={form.field}>
                  <label className={form.label} htmlFor="f-notes">
                    Additional notes (optional)
                  </label>
                  <textarea
                    id="f-notes"
                    name="notes"
                    rows={3}
                    className={form.textarea}
                    value={values.notes}
                    onChange={onField}
                  />
                </div>

                <label className={styles.consent}>
                  <input
                    type="checkbox"
                    checked={values.consent}
                    onChange={(e) => setValue('consent', e.target.checked)}
                    aria-describedby={errors.consent ? 'err-consent' : undefined}
                  />
                  <span className={styles.consentText}>
                    I consent to Coastline Catalyst storing this submission and contacting me
                    about it, as described in the <Link href="/privacy">privacy policy</Link>. *
                  </span>
                </label>
                {errors.consent && (
                  <p id="err-consent" role="alert" className={styles.consentError}>
                    {errors.consent}
                  </p>
                )}

                <Recaptcha onToken={setCaptchaToken} />
              </div>
            </div>
          </div>

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.back}
              data-visible={step > 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
            >
              <span aria-hidden="true">&larr;</span> Back
            </button>

            {step < 2 ? (
              <button type="button" className={form.pillButton} onClick={goNext}>
                Continue <span aria-hidden="true">&rarr;</span>
              </button>
            ) : (
              <button
                type="button"
                className={form.pillButton}
                disabled={!allPass || submitting}
                onClick={submit}
              >
                {submitting ? 'Submitting…' : 'Submit application'}
              </button>
            )}
          </div>

          {submitError && (
            <p role="alert" className={styles.submitError}>
              {submitError}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
