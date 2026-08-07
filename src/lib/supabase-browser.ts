'use client';

import { createClient } from '@supabase/supabase-js';

/**
 * BROWSER CLIENT. Anon key only.
 *
 * This client has ZERO DATABASE PERMISSIONS BY DESIGN. Both pitch_submissions
 * and contact_messages have row level security enabled with no policies at
 * all, which in Postgres denies everything to the anon role. Selecting or
 * inserting through this client will return nothing and change nothing. That
 * is the intended behaviour, not a gap to be patched with a policy.
 *
 * Its one job is uploading a pitch deck to a signed upload URL that a
 * serverless function minted. The signed token authorises that single upload
 * on its own, so a private bucket with no storage policies still works.
 *
 * The service role counterpart lives in src/app/api/_lib/supabase-server.ts
 * and must never be imported from here.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function supabaseBrowser() {
  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set both in .env.local.',
    );
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type UploadProgress = (fraction: number) => void;

/**
 * Uploads the deck to a signed upload URL, reporting progress as it goes.
 *
 * This is a PUT to the signed URL, which is precisely what supabase-js's
 * `uploadToSignedUrl` does internally. It is written out with XMLHttpRequest
 * here for one reason: fetch cannot report upload progress, and a 25MB deck on
 * a slow connection takes long enough that a silent UI looks broken. If XHR is
 * unavailable we fall back to `uploadToSignedUrl`, which works but can only
 * report start and finish.
 */
export function uploadDeck(
  signedUrl: string,
  path: string,
  token: string,
  file: File,
  onProgress: UploadProgress,
): Promise<void> {
  if (typeof XMLHttpRequest === 'undefined') {
    return supabaseBrowser()
      .storage.from('pitch-decks')
      .uploadToSignedUrl(path, token, file, { contentType: 'application/pdf' })
      .then(({ error }) => {
        if (error) throw new Error(error.message);
      });
  }

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', signedUrl, true);
    xhr.setRequestHeader('content-type', 'application/pdf');
    // Signed uploads reject a second write to the same path by default.
    xhr.setRequestHeader('x-upsert', 'false');

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) onProgress(e.loaded / e.total);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed. Check your connection and try again.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));
    xhr.send(file);
  });
}
