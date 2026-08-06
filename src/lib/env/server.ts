import "server-only";

import { z } from "zod";

import { formatEnvIssues, publicEnv, type PublicEnv } from "@/lib/env/public";

/**
 * Server-only secrets.
 *
 * `import "server-only"` turns a client import of this module into a BUILD
 * error rather than a silent runtime `undefined`. That is the actual guard —
 * a `typeof window` check is not one.
 *
 * Secrets are validated in independent groups so a project without ElevenLabs
 * or Kokoro still boots, and so an AI route's missing key cannot take down
 * authentication.
 */

const coreServerSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(40, "SUPABASE_SERVICE_ROLE_KEY مفقود")
});

const geminiSchema = z.object({
  GEMINI_API_KEY: z.string().min(10, "GEMINI_API_KEY مفقود")
});

const speechSchema = z.object({
  ELEVENLABS_API_KEY: z.string().min(10).optional(),
  KOKORO_API_URL: z.url().optional()
});

export type CoreServerEnv = PublicEnv & z.infer<typeof coreServerSchema>;
export type GeminiEnv = z.infer<typeof geminiSchema>;
export type SpeechEnv = z.infer<typeof speechSchema>;

let cachedCore: CoreServerEnv | null = null;
let cachedGemini: GeminiEnv | null = null;
let cachedSpeech: SpeechEnv | null = null;

/** Supabase service role + public vars. Required by admin client and guards. */
export function serverEnv(): CoreServerEnv {
  if (cachedCore) return cachedCore;

  const parsed = coreServerSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  if (!parsed.success) formatEnvIssues(parsed.error.issues);

  cachedCore = { ...publicEnv(), ...parsed.data };
  return cachedCore;
}

/** Only call from /api/ai/*. Throws a descriptive error if unset. */
export function geminiEnv(): GeminiEnv {
  if (cachedGemini) return cachedGemini;

  const parsed = geminiSchema.safeParse({ GEMINI_API_KEY: process.env.GEMINI_API_KEY });
  if (!parsed.success) formatEnvIssues(parsed.error.issues);

  cachedGemini = parsed.data;
  return cachedGemini;
}

/** Optional TTS providers. Never throws — callers decide the fallback. */
export function speechEnv(): SpeechEnv {
  if (cachedSpeech) return cachedSpeech;

  const parsed = speechSchema.safeParse({
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    KOKORO_API_URL: process.env.KOKORO_API_URL
  });

  if (!parsed.success) formatEnvIssues(parsed.error.issues);

  cachedSpeech = parsed.data;
  return cachedSpeech;
}