import 'server-only';
import { serverConfig } from './config';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifies a Cloudflare Turnstile token.
 *
 * A token is single use. It is redeemed by the endpoint that actually writes a
 * row, which is why /api/pitch/upload-url deliberately does not call this: it
 * would burn the token that /api/pitch/submit still needs.
 *
 * Returns false on any failure, including a network problem reaching
 * Cloudflare. Failing closed is the right default for a spam gate.
 */
export async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  if (!token) return false;

  const body = new URLSearchParams({
    secret: serverConfig().turnstileSecretKey,
    response: token,
  });
  if (ip) body.set('remoteip', ip);

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}
