import 'server-only';
import { supabaseAdmin } from './supabase-server';

/**
 * Rate limiting by IP.
 *
 * The row-counting limiter is the real one: it counts existing rows for this
 * IP in the table the request would write to, so it survives cold starts and
 * is shared across every serverless instance. Both tables have a
 * (submitted_ip, created_at desc) index for exactly this query.
 */
export async function tooManyRecentRows(
  table: 'contact_messages' | 'pitch_submissions',
  ip: string | null,
  max: number,
  windowMs: number,
): Promise<boolean> {
  // No usable IP means no signal to limit on. Turnstile is the other gate.
  if (!ip) return false;

  const since = new Date(Date.now() - windowMs).toISOString();

  const { count, error } = await supabaseAdmin()
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('submitted_ip', ip)
    .gte('created_at', since);

  // A failed count must not block a legitimate submission.
  if (error) return false;
  return (count ?? 0) >= max;
}

/**
 * In-memory limiter, used only by /api/pitch/upload-url.
 *
 * That endpoint writes no row, so there is nothing to count and the brief
 * rules out adding a table. This is therefore per serverless instance rather
 * than global: it blunts a naive loop from one client but is not a hard
 * guarantee. The real protection on the pitch flow is Turnstile plus the
 * row-counting limit at /api/pitch/submit, which is where anything durable
 * actually gets created.
 */
const hits = new Map<string, number[]>();

export function tooManyRecentCalls(key: string, max: number, windowMs: number): boolean {
  if (!key) return false;

  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((at) => now - at < windowMs);

  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (!times.some((at) => now - at < windowMs)) hits.delete(k);
    }
  }

  return false;
}

export const HOUR_MS = 60 * 60 * 1000;
