import 'server-only';

/**
 * Server-side validation. The client validates too, for a decent experience,
 * but nothing here trusts any of it. Every length, format and enum is checked
 * again on this side.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_DECK_BYTES = 1024; // 1KB
export const MAX_DECK_BYTES = 25 * 1024 * 1024; // 25MB, matches the bucket limit

/** `pending/{uuid}.pdf` and nothing else. */
export const PENDING_PATH_RE =
  /^pending\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/;

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value);
}

export function lengthWithin(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/** Optional free-text field: absent is fine, present must be sane. */
export function optionalWithin(value: string, max: number): boolean {
  return value.length <= max;
}

/* ---------------------------------------------------------------------------
 * funding_stage
 *
 * The form's select carries display strings. The database column is an enum
 * with snake_case values. This map is the single crossing point between them;
 * anything not in it is rejected rather than coerced.
 * ------------------------------------------------------------------------- */

export const STAGE_VALUES = ['idea', 'pre_seed', 'seed', 'series_a', 'later'] as const;
export type FundingStage = (typeof STAGE_VALUES)[number];

const STAGE_FROM_LABEL: Record<string, FundingStage> = {
  idea: 'idea',
  'pre-seed': 'pre_seed',
  'pre seed': 'pre_seed',
  pre_seed: 'pre_seed',
  seed: 'seed',
  'series a': 'series_a',
  series_a: 'series_a',
  later: 'later',
};

/** Returns null for an empty value (the column is nullable) and undefined for
 *  something that was supplied but is not a recognised stage. */
export function toFundingStage(raw: string): FundingStage | null | undefined {
  if (!raw) return null;
  return STAGE_FROM_LABEL[raw.trim().toLowerCase()] ?? undefined;
}

/* ---------------------------------------------------------------------------
 * Readable storage paths
 *
 * The team browses Storage by hand, so the final key has to be legible:
 *   submissions/{YYYY-MM}/{company-slug}-{first 8 of submission id}.pdf
 *   submissions/2026-08/oppam-a3f9c2d1.pdf
 *
 * Generated server side only, after validation, from the row's own id. A path
 * is never accepted from the client.
 * ------------------------------------------------------------------------- */

export function slugifyCompany(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    // Strip combining marks so accented letters reduce rather than vanish.
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    // A trailing hyphen can reappear after the truncation above.
    .replace(/-+$/, '');

  return slug || 'submission';
}

export function finalDeckPath(companyName: string, submissionId: string, when = new Date()): string {
  const month = `${when.getUTCFullYear()}-${String(when.getUTCMonth() + 1).padStart(2, '0')}`;
  // The id suffix makes collisions impossible, so the slug never has to be unique.
  return `submissions/${month}/${slugifyCompany(companyName)}-${submissionId.slice(0, 8)}.pdf`;
}
