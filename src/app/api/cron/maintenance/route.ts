import { NextResponse } from 'next/server';
import { serverConfig } from '../../_lib/config';
import { DECK_BUCKET, supabaseAdmin } from '../../_lib/supabase-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORPHAN_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Daily maintenance. Two jobs, both boring and both load-bearing.
 *
 * 1. Keep-alive. A free-tier Supabase project pauses after seven days without
 *    API traffic, and a paused project means every form fails. One trivial
 *    query a day prevents that.
 *
 * 2. Orphan cleanup. A successful submission moves its deck out of pending/
 *    immediately, so anything still sitting there after 24 hours belongs to an
 *    upload that was abandoned or rejected. Those are unreferenced confidential
 *    files; they should not accumulate.
 */
export async function GET(request: Request) {
  const expected = `Bearer ${serverConfig().cronSecret}`;
  if (request.headers.get('authorization') !== expected) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const supabase = supabaseAdmin();
  const result = { keepAlive: false, pendingScanned: 0, orphansDeleted: 0 };

  // 1. Keep-alive.
  const { error: pingError } = await supabase
    .from('pitch_submissions')
    .select('id', { count: 'exact', head: true })
    .limit(1);
  result.keepAlive = !pingError;
  if (pingError) console.error('[coastline] cron keep-alive failed', pingError.code);

  // 2. Orphan cleanup.
  const { data: objects, error: listError } = await supabase.storage
    .from(DECK_BUCKET)
    .list('pending', { limit: 1000, sortBy: { column: 'created_at', order: 'asc' } });

  if (listError) {
    console.error('[coastline] cron list failed', listError.name);
  } else if (objects?.length) {
    result.pendingScanned = objects.length;
    const cutoff = Date.now() - ORPHAN_AGE_MS;

    const stale = objects
      .filter((object) => {
        const created = object.created_at ? Date.parse(object.created_at) : NaN;
        return Number.isFinite(created) && created < cutoff;
      })
      .map((object) => `pending/${object.name}`);

    if (stale.length) {
      const { error: removeError } = await supabase.storage.from(DECK_BUCKET).remove(stale);
      if (removeError) console.error('[coastline] cron remove failed', removeError.name);
      else result.orphansDeleted = stale.length;
    }
  }

  // Counts only. No paths, no filenames.
  console.info(
    `[coastline] maintenance: keepAlive=${result.keepAlive} scanned=${result.pendingScanned} deleted=${result.orphansDeleted}`,
  );

  return NextResponse.json({ ok: true, ...result });
}
