import 'server-only';

/**
 * Every environment variable this backend needs, read in one place and
 * validated together.
 *
 * A missing variable throws MissingEnvError naming all of them at once, so a
 * misconfigured deploy fails with one obvious message instead of a scattering
 * of undefined-shaped bugs at 2am.
 *
 * The check runs on first use rather than at module import. Next.js imports
 * route modules while building, and secrets are frequently absent from a build
 * environment, so an import-time throw would fail the build rather than the
 * request. First use is the earliest point where failing is genuinely correct.
 */

export class MissingEnvError extends Error {
  readonly missing: readonly string[];

  constructor(missing: readonly string[]) {
    super(
      `Missing required environment variable${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}. ` +
        'Set these in .env.local for development and in the Vercel project settings for deploys.',
    );
    this.name = 'MissingEnvError';
    this.missing = missing;
  }
}

export type ServerConfig = {
  /** Browser-safe, but the server needs it too for the storage REST calls. */
  supabaseUrl: string;
  /** Server only. Bypasses RLS. Must never reach the browser. */
  supabaseServiceRoleKey: string;
  /** Server only. */
  turnstileSecretKey: string;
  /** Server only. Guards the maintenance cron. */
  cronSecret: string;
};

let cached: ServerConfig | null = null;

export function serverConfig(): ServerConfig {
  if (cached) return cached;

  const read = {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
    cronSecret: process.env.CRON_SECRET,
  };

  const names: Record<keyof ServerConfig, string> = {
    supabaseUrl: 'NEXT_PUBLIC_SUPABASE_URL',
    supabaseServiceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY',
    turnstileSecretKey: 'TURNSTILE_SECRET_KEY',
    cronSecret: 'CRON_SECRET',
  };

  const missing = (Object.keys(read) as (keyof ServerConfig)[])
    .filter((key) => !read[key])
    .map((key) => names[key]);

  if (missing.length) throw new MissingEnvError(missing);

  cached = read as ServerConfig;
  return cached;
}
