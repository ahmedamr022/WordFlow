"use client";

import { createBrowserClient } from "@supabase/ssr";

import { publicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database";

/**
 * Browser client — reads/writes the session from document.cookie.
 *
 * Memoised: createBrowserClient() spins up its own auth state machine and
 * refresh timer. Calling it per render (as the login page did) creates
 * duplicate token-refresh loops that race each other and can revoke a
 * perfectly good refresh token.
 */

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (browserClient) return browserClient;

  const env = publicEnv();

  browserClient = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return browserClient;
}