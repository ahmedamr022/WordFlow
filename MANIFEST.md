# قائمة الملفات

## ملفات جاهزة في هذا المجلد (22 ملف)

| # | الملف | العملية |
|---|-------|---------|
| 2.1 | `package.json` | استبدال |
| 2.2 | `postcss.config.mjs` | استبدال |
| 2.4 | `src/app/globals.css` | استبدال |
| 2.5 | `components.json` | استبدال |
| 2.6 | `next.config.mjs` | استبدال |
| 2.8 | `src/proxy.ts` | جديد |
| 2.9 | `src/lib/env/public.ts` | جديد |
| 2.9 | `src/lib/env/server.ts` | جديد |
| 2.10 | `src/lib/supabase/client.ts` | استبدال |
| 2.11 | `src/lib/supabase/server.ts` | استبدال |
| 2.12 | `src/lib/supabase/admin.ts` | استبدال |
| 2.13 | `src/lib/auth/session.ts` | **جديد — مصدر الحقيقة** |
| 2.14 | `src/components/auth/protected-shell.tsx` | استبدال |
| 2.15 | `src/components/auth/onboarding-shell.tsx` | جديد |
| 2.16 | `src/app/onboarding/layout.tsx` | استبدال |
| 2.17 | `src/app/onboarding/page.tsx` | جديد |
| 2.18 | `src/app/onboarding/auto-test/layout.tsx` | جديد |
| 2.19 | `src/app/dashboard/layout.tsx` | جديد |
| 2.20 | `src/app/dashboard/page.tsx` | استبدال |
| 2.21 | `src/app/auth/callback/route.ts` | استبدال |
| 2.22 | `src/app/auth/confirm/route.ts` | استبدال |
| 2.23 | `src/lib/auth/guards.ts` | استبدال |
| 2.24 | `src/lib/validation/schemas.ts` | استبدال |
| 2.25 | `src/app/actions/auth.ts` | استبدال |
| 2.26 | `src/app/(auth)/login/page.tsx` | استبدال |
| 2.27 | `src/app/(auth)/login/login-form.tsx` | جديد |
| 2.28 | `src/app/onboarding/level/page.tsx` | استبدال |
| 2.29 | `src/app/(auth)/reset-password/page.tsx` | استبدال |
| 2.30 | `src/app/(auth)/reset-password/reset-password-form.tsx` | جديد |
| 2.31 | `src/app/(auth)/forgot-password/page.tsx` | استبدال |
| 2.32 | `src/app/api/ai/explain/route.ts` | استبدال |
| 2.33 | `src/app/api/tts/route.ts` | استبدال |
| 2.34 | `src/app/layout.tsx` | استبدال |
| 2.35 | `supabase/migrations/0008_onboarding_source_of_truth.sql` | جديد (كان 0006) |
| 2.36 | `.env.example` | جديد |

## ملفات تُحذف من مشروعك (مش موجودة هنا)

| # | الملف |
|---|-------|
| 2.3 | `tailwind.config.ts` |
| 2.7 | `src/middleware.ts` |
| 2.9 | `src/lib/env.ts` |

## تعديلات اضطررت أعملها

1. **`login-form.tsx` و `onboarding/level/page.tsx`:** المستند الأصلي كان فيه
   `*` و `*_` مكان اللوجو، والأيقونات في أزرار Google/GitHub كانت فاضية
   (ضاعت وقت النسخ). عوّضتها بـ badge حرف `W` وأيقونات SVG inline — غيّرها
   بالأصول بتاعتك لو حابب.
2. **رقم الميجريشن:** `0006` → `0008` (شوف السبب في الملف نفسه).

## ملفات المستند بيشير ليها ولازم تكون موجودة عندك

الملفات دي مش جزء من الإصلاح لكن الكود بيستوردها:

- `@/types/database` (`Database`, `CefrLevel`) — يُفضّل إعادة توليدها:
  `npx supabase gen types typescript --project-id <ref> --schema public > src/types/database.ts`
- `@/lib/storage/legacyKeys` (`purgeLegacyStorage`)
- `@/components/layout/app-sidebar`
- `@/components/migration/legacy-progress-migrator`
- `@/components/dashboard/*`
- `public/images/login.png`
