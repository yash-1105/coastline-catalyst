import { NextResponse } from 'next/server';
import { notifyQuietly } from '../_lib/notify';
import { HOUR_MS, tooManyRecentRows } from '../_lib/rate-limit';
import { clientIp, readJson, str } from '../_lib/request';
import { supabaseAdmin } from '../_lib/supabase-server';
import { verifyTurnstile } from '../_lib/turnstile';
import { isEmail, lengthWithin, optionalWithin } from '../_lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PER_HOUR = 5;

export async function POST(request: Request) {
  const ip = clientIp(request);

  const body = await readJson(request);
  if (!body) {
    return NextResponse.json({ error: 'That message could not be read.' }, { status: 400 });
  }

  if (!(await verifyTurnstile(str(body.turnstileToken), ip))) {
    return NextResponse.json(
      { error: 'The spam check did not pass. Complete it again and resend.' },
      { status: 400 },
    );
  }

  const name = str(body.name);
  const email = str(body.email);
  const subject = str(body.subject);
  const message = str(body.message);

  if (!lengthWithin(name, 1, 120)) {
    return NextResponse.json(
      { error: 'Add your name, up to 120 characters.' },
      { status: 400 },
    );
  }
  if (!isEmail(email)) {
    return NextResponse.json(
      { error: 'That email looks incomplete. Check for a typo, e.g. name@company.com.' },
      { status: 400 },
    );
  }
  if (!optionalWithin(subject, 200)) {
    return NextResponse.json(
      { error: 'That subject is too long. Keep it under 200 characters.' },
      { status: 400 },
    );
  }
  if (!lengthWithin(message, 10, 5000)) {
    return NextResponse.json(
      { error: 'Write a little more, between 10 and 5000 characters.' },
      { status: 400 },
    );
  }

  if (await tooManyRecentRows('contact_messages', ip, MAX_PER_HOUR, HOUR_MS)) {
    return NextResponse.json(
      { error: 'That is a few messages in a short time. Try again in an hour.' },
      { status: 429 },
    );
  }

  const { data, error } = await supabaseAdmin()
    .from('contact_messages')
    .insert({
      name,
      email,
      subject: subject || null,
      message,
      submitted_ip: ip,
    })
    .select('id')
    .single();

  if (error || !data) {
    // Log the failure shape only. Never the message body or the address.
    // Code plus message: the message names the fault, e.g. "permission
    // denied for table". Neither contains user data.
    console.error(
      '[coastline] contact insert failed',
      error?.code ?? 'unknown',
      error?.message ?? '',
    );
    return NextResponse.json(
      {
        error:
          'Something went wrong sending that. Try again, or email us at hello@coastlinecatalyst.com.',
      },
      { status: 502 },
    );
  }

  await notifyQuietly({
    kind: 'new_contact',
    messageId: data.id as string,
    hasSubject: Boolean(subject),
  });

  return NextResponse.json({ ok: true });
}
