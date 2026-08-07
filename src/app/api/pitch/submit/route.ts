import { NextResponse } from 'next/server';
import { serverConfig } from '../../_lib/config';
import { notifyQuietly } from '../../_lib/notify';
import { HOUR_MS, tooManyRecentRows } from '../../_lib/rate-limit';
import { clientIp, readJson, str } from '../../_lib/request';
import { DECK_BUCKET, supabaseAdmin } from '../../_lib/supabase-server';
import { verifyTurnstile } from '../../_lib/turnstile';
import {
  MAX_DECK_BYTES,
  MIN_DECK_BYTES,
  PENDING_PATH_RE,
  finalDeckPath,
  isEmail,
  lengthWithin,
  optionalWithin,
  toFundingStage,
} from '../../_lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PER_HOUR = 5;

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Best effort tidy-up. A failure here must not change the response. */
async function removeObject(path: string): Promise<void> {
  try {
    await supabaseAdmin().storage.from(DECK_BUCKET).remove([path]);
  } catch {
    // Left for the maintenance cron to sweep.
  }
}

/**
 * Reads the first five bytes of the stored object and checks for `%PDF-`.
 *
 * The bucket's allowed_mime_types can be satisfied by simply claiming the
 * content type on upload, so it proves nothing about the bytes. This does.
 * Only five bytes are fetched, via a Range request, so a 25MB file costs
 * nothing to check.
 */
async function storedFileIsPdf(path: string): Promise<boolean> {
  const { supabaseUrl, supabaseServiceRoleKey } = serverConfig();

  try {
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${DECK_BUCKET}/${encodeURI(path)}`,
      {
        headers: {
          authorization: `Bearer ${supabaseServiceRoleKey}`,
          range: 'bytes=0-4',
        },
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) return false;
    const head = new Uint8Array(await response.arrayBuffer());
    // %PDF-
    return (
      head.length >= 5 &&
      head[0] === 0x25 &&
      head[1] === 0x50 &&
      head[2] === 0x44 &&
      head[3] === 0x46 &&
      head[4] === 0x2d
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  const body = await readJson(request);
  if (!body) return bad('That submission could not be read.');

  const deckPath = str(body.deckPath);

  // Shape-check the path before anything else touches storage.
  if (!PENDING_PATH_RE.test(deckPath)) {
    return bad('That upload reference is not valid. Attach the deck again.');
  }

  if (!(await verifyTurnstile(str(body.turnstileToken), ip))) {
    await removeObject(deckPath);
    return bad('The spam check did not pass. Complete it again and resubmit.');
  }

  const companyName = str(body.companyName);
  const founderName = str(body.founderName);
  const email = str(body.email);
  const phone = str(body.phone);
  const website = str(body.website);
  const linkedin = str(body.linkedin);
  const revenueBand = str(body.revenueBand);
  const industry = str(body.industry);
  const country = str(body.country);
  const description = str(body.description);
  const whyCoastline = str(body.whyCoastline);
  const deckFilename = str(body.deckFilename);
  const deckSizeBytes = typeof body.deckSizeBytes === 'number' ? body.deckSizeBytes : NaN;

  const reject = async (message: string, status = 400) => {
    await removeObject(deckPath);
    return bad(message, status);
  };

  if (!lengthWithin(companyName, 1, 200)) {
    return reject('Add your company name so we know who is applying.');
  }
  if (!lengthWithin(founderName, 1, 200)) {
    return reject('Add your name so we know who to reply to.');
  }
  if (!isEmail(email)) {
    return reject('That email looks incomplete. Check for a typo, e.g. name@company.com.');
  }

  const stage = toFundingStage(str(body.stage));
  if (stage === undefined) {
    return reject('Pick the stage that fits best. An honest guess is fine.');
  }

  for (const [value, max, label] of [
    [phone, 60, 'phone number'],
    [website, 500, 'website'],
    [linkedin, 500, 'LinkedIn URL'],
    [revenueBand, 100, 'revenue range'],
    [industry, 200, 'industry'],
    [country, 120, 'country'],
    [deckFilename, 255, 'file name'],
  ] as const) {
    if (!optionalWithin(value, max)) return reject(`That ${label} is too long.`);
  }

  if (!optionalWithin(description, 5000)) return reject('That description is too long.');
  if (!optionalWithin(whyCoastline, 5000)) return reject('That answer is too long.');

  if (
    !Number.isFinite(deckSizeBytes) ||
    deckSizeBytes < MIN_DECK_BYTES ||
    deckSizeBytes > MAX_DECK_BYTES
  ) {
    return reject('That file is over 25MB. Compress the PDF and try again.', 413);
  }

  if (await tooManyRecentRows('pitch_submissions', ip, MAX_PER_HOUR, HOUR_MS)) {
    return reject('That is a few applications in a short time. Try again in an hour.', 429);
  }

  // The bytes themselves, not the claimed content type.
  if (!(await storedFileIsPdf(deckPath))) {
    await removeObject(deckPath);
    return bad('That file is not a PDF. Export your deck as a PDF and try again.');
  }

  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('pitch_submissions')
    .insert({
      company_name: companyName,
      founder_name: founderName,
      email,
      phone: phone || null,
      website: website || null,
      linkedin: linkedin || null,
      stage,
      revenue_band: revenueBand || null,
      industry: industry || null,
      country: country || null,
      description: description || null,
      why_coastline: whyCoastline || null,
      deck_path: deckPath,
      deck_filename: deckFilename || null,
      deck_size_bytes: deckSizeBytes,
      submitted_ip: ip,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error(
      '[coastline] pitch insert failed',
      error?.code ?? 'unknown',
      error?.message ?? '',
    );
    // No row, so the object would orphan. Remove it.
    await removeObject(deckPath);
    return bad(
      'Something went wrong sending that. Try again, or email your deck to hello@coastlinecatalyst.com.',
      502,
    );
  }

  const submissionId = data.id as string;

  /* Move the deck to a path a human can read while browsing Storage, which is
     the actual review workflow here. If the move fails the row is already
     saved and still points at the pending path, so the submission is intact
     and only slightly less tidy. Never fail the request for this. */
  const finalPath = finalDeckPath(companyName, submissionId);
  const { error: moveError } = await supabase.storage
    .from(DECK_BUCKET)
    .move(deckPath, finalPath);

  if (!moveError) {
    const { error: updateError } = await supabase
      .from('pitch_submissions')
      .update({ deck_path: finalPath })
      .eq('id', submissionId);

    if (updateError) {
      // Row and object now disagree. Log the id so it can be reconciled.
      console.error('[coastline] deck_path update failed for', submissionId, updateError.code);
    }
  } else {
    console.error('[coastline] deck move failed for', submissionId, moveError.name);
  }

  await notifyQuietly({ kind: 'new_pitch', submissionId, companyName });

  return NextResponse.json({ ok: true });
}
