import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { publicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database";

/**
 * Session-bound server client — always subject to RLS.
 *
 * The empty catch is intentional and correct: Server Components may not
 * mutate cookies. proxy.ts owns cookie rotation. Server Actions and Route
 * Handlers CAN write, and do so through this same path.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const env = publicEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {

            // Called from a Server Component — proxy.ts syncs the cookies.
          }}
      }
    }
  );
}