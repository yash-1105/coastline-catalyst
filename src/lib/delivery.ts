import 'server-only';

/**
 * Delivery for the two forms. Nothing is stored by the site itself; a
 * submission is forwarded to whichever transport is configured:
 *
 *   1. PITCH_WEBHOOK_URL / CONTACT_WEBHOOK_URL  → POST JSON (deck as base64)
 *   2. RESEND_API_KEY + NOTIFY_EMAIL + FROM_EMAIL → email, deck attached
 *   3. development only                          → written to .submissions/
 *
 * With none of these set a production request fails loudly rather than
 * silently dropping a founder's application.
 */

export type Attachment = { filename: string; contentType: string; bytes: Buffer };

export class DeliveryNotConfiguredError extends Error {
  constructor() {
    super(
      'No delivery transport is configured. Set PITCH_WEBHOOK_URL, or RESEND_API_KEY with NOTIFY_EMAIL and FROM_EMAIL.',
    );
    this.name = 'DeliveryNotConfiguredError';
  }
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

function toHtml(subject: string, fields: Record<string, string>) {
  const rows = Object.entries(fields)
    .filter(([, value]) => value !== '')
    .map(
      ([key, value]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6B7280;vertical-align:top;white-space:nowrap">${escapeHtml(
          key,
        )}</td><td style="padding:6px 0;color:#0C1116">${escapeHtml(value).replace(
          /\n/g,
          '<br>',
        )}</td></tr>`,
    )
    .join('');

  return `<div style="font-family:Inter,system-ui,sans-serif;font-size:14px;line-height:1.6"><h2 style="font-size:18px;color:#0C1116">${escapeHtml(
    subject,
  )}</h2><table style="border-collapse:collapse">${rows}</table></div>`;
}

async function sendWebhook(url: string, fields: Record<string, string>, file?: Attachment) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      ...fields,
      submittedAt: new Date().toISOString(),
      ...(file
        ? {
            deck: {
              filename: file.filename,
              contentType: file.contentType,
              base64: file.bytes.toString('base64'),
            },
          }
        : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Webhook responded ${response.status}`);
  }
}

async function sendEmail(subject: string, fields: Record<string, string>, file?: Attachment) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.FROM_EMAIL,
      to: [process.env.NOTIFY_EMAIL],
      reply_to: fields.Email || undefined,
      subject,
      html: toHtml(subject, fields),
      ...(file
        ? {
            attachments: [
              { filename: file.filename, content: file.bytes.toString('base64') },
            ],
          }
        : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`Email provider responded ${response.status}: ${await response.text()}`);
  }
}

async function writeToDisk(kind: string, fields: Record<string, string>, file?: Attachment) {
  const { mkdir, writeFile } = await import('node:fs/promises');
  const { join } = await import('node:path');

  const dir = join(process.cwd(), '.submissions');
  await mkdir(dir, { recursive: true });

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await writeFile(
    join(dir, `${kind}-${stamp}.json`),
    JSON.stringify({ ...fields, deck: file?.filename ?? null }, null, 2),
  );
  if (file) await writeFile(join(dir, `${kind}-${stamp}-${file.filename}`), file.bytes);

  console.warn(
    `[coastline] No delivery transport configured. ${kind} written to .submissions/${kind}-${stamp}.json`,
  );
}

export async function deliver(
  kind: 'pitch' | 'contact',
  subject: string,
  fields: Record<string, string>,
  file?: Attachment,
) {
  const webhook =
    kind === 'pitch' ? process.env.PITCH_WEBHOOK_URL : process.env.CONTACT_WEBHOOK_URL;

  if (webhook) return sendWebhook(webhook, fields, file);

  if (process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL && process.env.FROM_EMAIL) {
    return sendEmail(subject, fields, file);
  }

  if (process.env.NODE_ENV !== 'production') return writeToDisk(kind, fields, file);

  throw new DeliveryNotConfiguredError();
}
