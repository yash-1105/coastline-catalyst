import { NextResponse } from 'next/server';
import { DeliveryNotConfiguredError, deliver } from '@/lib/delivery';
import { clientKey, rateLimit } from '@/lib/guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!rateLimit(`contact:${clientKey(request)}`)) {
    return NextResponse.json(
      { error: 'Too many messages from this connection. Try again in a few minutes.' },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'That message could not be read.' }, { status: 400 });
  }

  const text = (name: string) => String(body[name] ?? '').trim();
  const name = text('name');
  const email = text('email');
  const message = text('message');

  if (!name || !message) {
    return NextResponse.json({ error: 'Add your name and a message.' }, { status: 400 });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: 'That email looks incomplete. Check for a typo, e.g. name@company.com.' },
      { status: 400 },
    );
  }

  try {
    await deliver('contact', `Contact form: ${text('subject') || 'No subject'}`, {
      Name: name,
      Email: email,
      Subject: text('subject'),
      Message: message,
    });
  } catch (error) {
    console.error('[coastline] contact delivery failed', error);
    const status = error instanceof DeliveryNotConfiguredError ? 503 : 502;
    return NextResponse.json(
      {
        error:
          'Something went wrong sending that. Try again, or email us at hello@coastlinecatalyst.com.',
      },
      { status },
    );
  }

  return NextResponse.json({ ok: true });
}
