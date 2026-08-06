import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { normalizeAppearance } from "@/lib/stories/appearance";
import type { StoryAppearance } from "@/types/admin";

/**
 * قراءة إعدادات المظهر المنشورة لقصة واحدة.
 *
 * سبب وجود هذا الملف هو أهم بَج في الحزمة السابقة:
 *   `dashboard/page.tsx` كانت ترندر `<StoryOfTheDay story={...} />` **بدون
 *   تمرير `appearance` مطلقاً**. المكوّن كان يقرأ `undefined` فيرجع للافتراضي
 *   المدفون في الكود. النتيجة: الأدمن يضبط الموضع والتعتيم في الاستوديو،
 *   يُحفَظ في `stories.appearance` فعلاً، ثم لا يظهر شيء في الداشبورد —
 *   وبالتحديد «تغيير الـ Y مش بيتغير».
 *
 * الاستعلام مغلَّف بـ `cache()` فلا يتكرر داخل نفس الطلب، ويفشل بهدوء
 * (يرجّع null) حتى لا تنكسر الداشبورد لو لم تكن القصة في جدول `stories` بعد
 * (الكتالوج الثابت لا يزال مصدر بعض القصص).
 */

export interface PublishedStoryVisuals {
  appearance: StoryAppearance;
  coverImage: string | null;
  bgImage: string | null;
}

export const getStoryVisuals = cache(
  async (slug: string | null | undefined): Promise<PublishedStoryVisuals | null> => {
    if (!slug) return null;

    try {
      const supabase = await createClient();
      const { data, error } = await supabase.
      from("stories").
      select("slug, cover_image, bg_image, appearance").
      eq("slug", slug).
      maybeSingle();

      if (error || !data) return null;

      return {
        appearance: normalizeAppearance(data.appearance),
        coverImage: data.cover_image as string | null ?? null,
        bgImage: data.bg_image as string | null ?? null
      };
    } catch {
      return null;
    }
  }
);