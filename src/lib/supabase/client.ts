import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables are missing!");
    return createBrowserClient(
      "https://placeholder.supabase.co",
      "sb_publishable_U8srx59omH3L4220jnDtWw_PldnDopg"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}