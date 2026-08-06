import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * مستوى المستخدم (CEFR) من `profiles.english_level`.
 *
 * كان كل ملف يعيد كتابة هذا الاستعلام بنفسه (dashboard/data.ts،
 * vocabulary/data.ts، actions/stats.ts…) ولم تكن شاشات القصص تقرأه إطلاقاً —
 * ولذلك «موصى به لك» لم تكن لها أي علاقة بمستوى المستخدم. الآن قراءة واحدة
 * مغلَّفة بـ `cache()` يستخدمها الترشيح.
 */

const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const getUserLevel = cache(async (): Promise<string> => {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) return "A1";

    const { data } = await supabase.
    from("profiles").
    select("english_level").
    eq("id", user.id).
    maybeSingle();

    const raw = String(
      (data as {english_level?: string | null;} | null)?.english_level ?? ""
    ).toUpperCase();

    return CEFR.includes(raw) ? raw : "A1";
  } catch {
    return "A1";
  }
});