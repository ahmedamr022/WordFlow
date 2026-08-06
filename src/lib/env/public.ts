import { z } from "zod";

/**
 * Browser-safe environment.
 *
 * Rules:
 *  · No fallbacks for real credentials. Ever. Fail loud.
 *  · Every process.env read is STATIC so Next can inline it client-side.
 *  · Validation is LAZY (called from inside functions), so `next build`
 *    does not explode while collecting page data.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url("NEXT_PUBLIC_SUPABASE_URL يجب أن يكون رابطاً صالحاً"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.
  string().
  min(40, "NEXT_PUBLIC_SUPABASE_ANON_KEY مفقود أو قصير"),
  NEXT_PUBLIC_SITE_URL: z.url("NEXT_PUBLIC_SITE_URL يجب أن يكون رابطاً صالحاً")
});

export type PublicEnv = z.infer<typeof publicSchema>;

export function formatEnvIssues(
issues: readonly {path: PropertyKey[];message: string;}[])
: never {
  const details = issues.map((i) => `  · ${i.path.join(".")}: ${i.message}`).join("\n");
  throw new Error(`\n[env] إعدادات البيئة غير صالحة:\n${details}\n`);
}

/**
 * Resolves the canonical site origin.
 * Order: explicit NEXT_PUBLIC_SITE_URL -> Vercel production -> Vercel preview
 *        -> localhost (development only).
 */
function resolveSiteUrl(): string | undefined {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;

  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;

  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";

  return undefined;
}

let cached: PublicEnv | null = null;

export function publicEnv(): PublicEnv {
  if (cached) return cached;

  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: resolveSiteUrl()
  });

  if (!parsed.success) formatEnvIssues(parsed.error.issues);

  cached = parsed.data;
  return cached;
}

/** Canonical origin without a trailing slash — safe for building redirect URLs. */
export function siteOrigin(): string {
  return new URL(publicEnv().NEXT_PUBLIC_SITE_URL).origin;
}