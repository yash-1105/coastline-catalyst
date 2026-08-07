import { NextResponse } from 'next/server';
import { DeliveryNotConfiguredError, deliver } from '@/lib/delivery';
import { clientKey, rateLimit, verifyRecaptcha } from '@/lib/guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 25 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERIC_ERROR =
  'Something went wrong sending that. Try again, or email your deck to hello@coastlinecatalyst.com.';

export async function POST(request: Request) {
  if (!rateLimit(`pitch:${clientKey(request)}`)) {
    return NextResponse.json(
      { error: 'Too many submissions from this connection. Try again in a few minutes.' },
      { status: 429 },
    );
  }

  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return NextResponse.json({ error: 'That submission could not be read.' }, { status: 400 });
  }

  const text = (name: string) => String(data.get(name) ?? '').trim();

  if (!(await verifyRecaptcha(text('recaptchaToken') || null))) {
    return NextResponse.json(
      { error: 'The spam check did not pass. Tick the box again and resubmit.' },
      { status: 400 },
    );
  }

  // Never trust the client: every required rule is re-checked here.
  const required = {
    company: text('company'),
    founder: text('founder'),
    email: text('email'),
    stage: text('stage'),
    industry: text('industry'),
    country: text('country'),
    desc: text('desc'),
    why: text('why'),
  };

  if (Object.values(required).some((value) => !value)) {
    return NextResponse.json({ error: 'Some required answers are missing.' }, { status: 400 });
  }

  if (!EMAIL_RE.test(required.email)) {
    return NextResponse.json(
      { error: 'That email looks incomplete. Check for a typo, e.g. name@company.com.' },
      { status: 400 },
    );
  }

  if (required.desc.length < 40) {
    return NextResponse.json(
      { error: 'Give us at least a couple of sentences, 40 characters or more.' },
      { status: 400 },
    );
  }

  if (text('consent') !== 'true') {
    return NextResponse.json(
      { error: 'Tick the box so we have your permission to store and review this.' },
      { status: 400 },
    );
  }

  const deck = data.get('deck');
  if (!(deck instanceof File) || deck.size === 0) {
    return NextResponse.json(
      { error: 'Attach your pitch deck as a single PDF so we can review it.' },
      { status: 400 },
    );
  }

  if (deck.type !== 'application/pdf' && !/\.pdf$/i.test(deck.name)) {
    return NextResponse.json(
      { error: 'That file is not a PDF. Export your deck as a PDF and try again.' },
      { status: 400 },
    );
  }

  if (deck.size > MAX_BYTES) {
    return NextResponse.json(
      { error: 'That file is over 25MB. Compress the PDF and try again.' },
      { status: 413 },
    );
  }

  const fields: Record<string, string> = {
    Company: required.company,
    Founder: required.founder,
    Email: required.email,
    Phone: text('phone'),
    Website: text('website'),
    LinkedIn: text('linkedin'),
    Stage: required.stage,
    Revenue: text('revenue'),
    Industry: required.industry,
    Country: required.country,
    Description: required.desc,
    'Why Coastline': required.why,
    Notes: text('notes'),
  };

  try {
    await deliver('pitch', `Founder application: ${required.company}`, fields, {
      filename: deck.name,
      contentType: 'application/pdf',
      bytes: Buffer.from(await deck.arrayBuffer()),
    });
  } catch (error) {
    console.error('[coastline] pitch delivery failed', error);
    const status = error instanceof DeliveryNotConfiguredError ? 503 : 502;
    return NextResponse.json({ error: GENERIC_ERROR }, { status });
  }

  return NextResponse.json({ ok: true });
}
