import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { serverEnv } from "@/lib/env/server";
import type { Database } from "@/types/database";

/**
 * Service-role client — bypasses RLS entirely.
 *
 * Allowed uses ONLY:
 *   · SECURITY DEFINER rpc calls (award_xp, record_line_attempt, ...)
 *   · check_rate_limit
 *   · ai_usage_log writes
 *   · the seed script
 *
 * `import "server-only"` makes importing this from a Client Component a
 * build error, which is the guarantee the old runtime `typeof window` check
 * could not give.
 *
 * Memoised: a new supabase-js instance per request leaks sockets under load.
 */

let adminClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createAdminClient() {
  if (adminClient) return adminClient;

  const env = serverEnv();

  adminClient = createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );

  return adminClient;
}