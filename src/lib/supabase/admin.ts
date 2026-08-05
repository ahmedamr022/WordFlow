import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * عميل service role — يتجاوز RLS بالكامل.
 * الاستخدام المسموح فقط:
 *   · دوال منح الـ XP وتسجيل التقدم (SECURITY DEFINER عبر rpc)
 *   · check_rate_limit
 *   · سكربت الـ seed
 * ممنوع منعاً باتاً استيراد هذا الملف من أي كود يعمل في المتصفح.
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error("[supabase] createAdminClient() لا يجوز استدعاؤها من المتصفح");
  }
  const env = serverEnv();
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}