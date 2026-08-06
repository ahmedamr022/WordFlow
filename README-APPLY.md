# WordFlow — ملفات الإصلاح الجاهزة

كل الملفات جوّه المجلد ده مكتوبة بمساراتها الحقيقية بالنسبة لجذر مشروع WordFlow.

## طريقة الاستخدام

1. حمّل المشروع ده (Download / Export).
2. انسخ **محتويات** مجلد `wordflow/` فوق جذر مشروع WordFlow (مش المجلد نفسه).
3. احذف الملفات التالية من مشروعك:
   - `tailwind.config.ts`
   - `src/middleware.ts`
   - `src/lib/env.ts`
4. شغّل:
   ```bash
   pnpm install
   pnpm typecheck
   pnpm build
   pnpm dev
   ```

## ملاحظة مهمة على الميجريشن

الملف اتسمّى `supabase/migrations/0008_onboarding_source_of_truth.sql`
(الأصل في المستند كان `0006` — لكن عندك `0006_xp_streak_functions.sql` موجود بالفعل
و`0007_rls_policies.sql` كمان، فلازم يبقى 0008).

## حالة الملفات

راجع `wordflow/MANIFEST.md` لمعرفة الملفات اللي اتكتبت والباقي.
