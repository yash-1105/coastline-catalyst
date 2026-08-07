import { NextResponse } from 'next/server';
import { HOUR_MS, tooManyRecentCalls } from '../../_lib/rate-limit';
import { clientIp, readJson, str } from '../../_lib/request';
import { DECK_BUCKET, supabaseAdmin } from '../../_lib/supabase-server';
import { MAX_DECK_BYTES, MIN_DECK_BYTES } from '../../_lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CALLS_PER_HOUR = 12;

/**
 * Mints a signed upload URL so the browser can send the deck straight to
 * Supabase Storage.
 *
 * The file must never pass through this function: Vercel caps a serverless
 * request body at 4.5MB and decks run to 25MB. This endpoint therefore only
 * ever handles a few bytes of JSON.
 *
 * NO TURNSTILE CHECK HERE, DELIBERATELY. A Turnstile token can be redeemed
 * once, and /api/pitch/submit needs it. Verifying here would burn the token
 * and make every real submission fail. Validation and rate limiting stand in
 * for it, and nothing durable is created: an unclaimed pending object is
 * swept by the daily maintenance cron.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);

  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: 'That request could not be read.' }, { status: 400 });
  }

  const filename = str(body.filename);
  const sizeBytes = typeof body.sizeBytes === 'number' ? body.sizeBytes : NaN;

  if (!filename || filename.length > 255 || !/\.pdf$/i.test(filename)) {
    return NextResponse.json(
      { error: 'Attach your pitch deck as a single PDF so we can review it.' },
      { status: 400 },
    );
  }

  if (!Number.isFinite(sizeBytes) || !Number.isInteger(sizeBytes)) {
    return NextResponse.json({ error: 'That file size could not be read.' }, { status: 400 });
  }

  if (sizeBytes < MIN_DECK_BYTES) {
    return NextResponse.json(
      { error: 'That file looks empty. Check the PDF and try again.' },
      { status: 400 },
    );
  }

  if (sizeBytes > MAX_DECK_BYTES) {
    return NextResponse.json(
      { error: 'That file is over 25MB. Compress the PDF and try again.' },
      { status: 413 },
    );
  }

  if (tooManyRecentCalls(`upload:${ip ?? 'unknown'}`, MAX_CALLS_PER_HOUR, HOUR_MS)) {
    return NextResponse.json(
      { error: 'That is a lot of upload attempts. Try again in an hour.' },
      { status: 429 },
    );
  }

  /* The user's filename never touches the path. It is attacker-controlled and
     would bring path traversal and collisions with it. A uuid is the whole
     name; the original is stored in deck_filename on the row instead. The
     readable final path is built server side after the row exists. */
  const path = `pending/${crypto.randomUUID()}.pdf`;

  const { data, error } = await supabaseAdmin()
    .storage.from(DECK_BUCKET)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error('[coastline] signed upload url failed', error?.name ?? 'unknown');
    return NextResponse.json(
      { error: 'Could not start the upload. Try again in a moment.' },
      { status: 502 },
    );
  }

  return NextResponse.json({
    path: data.path,
    token: data.token,
    // Returned so the browser can PUT with progress events. See uploadDeck().
    signedUrl: data.signedUrl,
  });
}
