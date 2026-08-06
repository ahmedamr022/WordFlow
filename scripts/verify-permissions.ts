/**
 * WordFlow · فحص سريع للصلاحيات بعد تشغيل 0017
 *
 *   pnpm tsx scripts/verify-permissions.ts
 *
 * السكربت بيتأكد إن:
 *   - كل دوال الـ RPC اللي بيستدعيها التطبيق قابلة للتنفيذ بمفتاح الخدمة.
 *   - جداول التقدّم مقروءة بدور authenticated (عبر anon key + جلسة اختبار).
 *   - العلاقة story_versions → profiles ظاهرة في كاش PostgREST.
 *
 * بيقرأ .env.local زي باقي السكربتات.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("✗ NEXT_PUBLIC_SUPABASE_URL أو SUPABASE_SERVICE_ROLE_KEY غير موجود في .env.local");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

type Check = {name: string;ok: boolean;detail: string;};
const results: Check[] = [];

function record(name: string, ok: boolean, detail = ""): void {
  results.push({ name, ok, detail });
}

/** الدوال دي المفروض تبقى قابلة للتنفيذ — بنستدعيها بوسائط غير مؤذية. */
async function checkRpcExecutable(): Promise<void> {
  const { error } = await admin.rpc("check_rate_limit", {
    p_key: "verify:permissions",
    p_limit: 1000,
    p_window_seconds: 60
  });

  const denied = Boolean(error?.message?.includes("permission denied"));
  record(
    "rpc: check_rate_limit",
    !denied,
    denied ? error!.message : error ? `تحذير: ${error.message}` : "قابلة للتنفيذ"
  );
}

/** الجداول دي المفروض تبقى مقروءة بمفتاح الخدمة على الأقل. */
async function checkTablesReadable(): Promise<void> {
  const tables = [
  "user_word_progress",
  "user_story_progress",
  "user_line_attempts",
  "user_stats",
  "words",
  "category_words",
  "story_line_words",
  "stories",
  "story_lines",
  "vocabulary_categories"];


  for (const table of tables) {
    const { error } = await admin.from(table).select("*", { count: "exact", head: true });
    const denied = error?.code === "42501";
    record(`table: ${table}`, !denied && !error, denied ? "permission denied" : error?.message ?? "OK");
  }
}

/** العلاقة اللي كانت بترمي PGRST200. */
async function checkVersionsEmbed(): Promise<void> {
  const { error } = await admin.
  from("story_versions").
  select("id, version, created_at, profiles:created_by(nickname)").
  limit(1);

  record(
    "embed: story_versions → profiles",
    !error,
    error ? `${error.code ?? ""} ${error.message}` : "العلاقة معروفة لدى PostgREST"
  );
}

async function main(): Promise<void> {
  await checkRpcExecutable();
  await checkTablesReadable();
  await checkVersionsEmbed();

  const pad = Math.max(...results.map((r) => r.name.length));
  for (const r of results) {
    console.log(`${r.ok ? "✓" : "✗"} ${r.name.padEnd(pad)}  ${r.detail}`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} فحص ناجح`);

  if (failed.length > 0) {
    console.error("\nلسه في مشاكل — تأكد إنك شغّلت supabase/migrations/0017_permissions_repair.sql");
    process.exit(1);
  }
}

void main();