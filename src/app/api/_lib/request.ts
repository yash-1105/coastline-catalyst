import 'server-only';

/**
 * Client IP, for the submitted_ip column and for rate limiting.
 *
 * The column is `inet`, so an unparseable value would make the insert fail.
 * Anything that is not clearly an IPv4 or IPv6 address becomes null: losing a
 * rate limit signal is much better than losing a founder's application.
 */

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-f:]+$/i;

export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const candidate = (forwarded?.split(',')[0] ?? request.headers.get('x-real-ip') ?? '').trim();

  if (!candidate) return null;
  if (IPV4.test(candidate)) return candidate;
  // Loose IPv6 check: hex and colons, at least one colon, sane length.
  if (candidate.includes(':') && IPV6.test(candidate) && candidate.length <= 45) return candidate;
  return null;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Trims and coerces an unknown JSON value to a string. */
export function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}
