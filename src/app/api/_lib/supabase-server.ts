import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { serverConfig } from './config';

/**
 * SERVER ONLY. Holds the service role key, which bypasses row level security
 * entirely.
 *
 * Both tables have RLS enabled with zero policies, so this client is the only
 * thing on earth that can read or write them. If this key ever reaches a
 * browser, every pitch deck and contact message is readable by anyone.
 *
 * Two guards keep it here:
 *   1. `import 'server-only'` above, which makes the build fail if any client
 *      component imports this file, directly or transitively.
 *   2. The runtime check below, which is belt and braces for anything that
 *      slips past the bundler, such as a dynamic import.
 *
 * The browser counterpart is src/lib/supabase-browser.ts, which carries the
 * anon key and can do nothing at all to these tables.
 */

function assertServer(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      'supabase-server was evaluated in a browser context. The service role key must never leave the server.',
    );
  }
}

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  assertServer();
  if (cached) return cached;

  const { supabaseUrl, supabaseServiceRoleKey } = serverConfig();

  cached = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      // No user sessions here. Nothing to persist or refresh.
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cached;
}

export const DECK_BUCKET = 'pitch-decks';
