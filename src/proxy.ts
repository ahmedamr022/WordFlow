import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Next.js 16 renamed `middleware.ts` -> `proxy.ts` (exported fn: `proxy`).
 *
 * ما تغيّر هنا وليه:
 *
 * 1. الأداء: `auth.getUser()` كانت رحلة شبكة كاملة إلى Supabase على كل تنقل.
 *    الآن `getClaims()` تتحقق من الـ JWT محلياً (وتجدّد الكوكيز عند الحاجة).
 *
 * 2. طلبات الـ prefetch مستثناة — الـ prefetch لا يجب أن يغيّر ملاحة.
 *
 * 3. **الجديد**: `/register` لم يبقَ ضمن الصفحات التي يُطرد منها المسجَّل.
 *    قبل كذا: لو عندك جلسة في الكوكيز وضغطت «ابدأ الآن» في صفحة الهبوط،
 *    الـ proxy كان يحوّلك فوراً إلى /dashboard فيستحيل إنشاء حساب جديد من
 *    نفس المتصفح. الآن:
 *      · «تسجيل الدخول» (/login) → لو أنت مسجَّل بالفعل يدخلك /dashboard مباشرة.
 *      · «ابدأ الآن» (/register) → يفتح صفحة إنشاء حساب جديد فعلاً.
 *    التصريح الحقيقي في ProtectedShell / server actions، وليس هنا
 *    (راجع CVE-2025-29927)، فترك /register مفتوحة لا يفتح أي ثغرة.
 */

const PROTECTED_PREFIXES = [
"/dashboard",
"/stories",
"/story",
"/vocabulary",
"/paths",
"/stats",
"/challenges",
"/profile",
"/settings",
"/onboarding"] as
const;

/**
 * صفحات يُعاد توجيه المسجَّل منها.
 * لاحظ: `/register` **ليست** هنا بقصد (انظر التعليق أعلى الملف).
 */
const AUTH_ONLY_PAGES = new Set(["/login", "/forgot-password"]);

function isInternalPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // لا نُسقِط الموقع كله على نشر مضبوط خطأ؛ طبقة البيانات ترمي خطأ واضحاً.
  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  // تحقق محلي من الـ JWT. يجدّد التوكن ويكتب الكوكيز فقط لو قارب الانتهاء،
  // فلا توجد رحلة شبكة في الحالة الطبيعية.
  let isAuthenticated = false;
  try {
    const { data } = await supabase.auth.getClaims();
    isAuthenticated = Boolean(data?.claims?.sub);
  } catch {
    isAuthenticated = false;
  }

  const { pathname, search } = request.nextUrl;

  // لا تُعِد توجيه طلبات التحميل المسبق — الـ prefetch لا يجب أن يغيّر ملاحة.
  const isPrefetch =
  request.headers.get("next-router-prefetch") === "1" ||
  request.headers.get("purpose") === "prefetch";

  if (isPrefetch) return response;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && AUTH_ONLY_PAGES.has(pathname)) {
    const requested = request.nextUrl.searchParams.get("next");
    const url = request.nextUrl.clone();
    url.pathname = requested && isInternalPath(requested) ? requested : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
  /*
   * كل شيء ما عدا:
   *  - داخليات Next والأصول الثابتة
   *  - /auth/*  (callback + confirm يبدّلان الكود بنفسيهما ولا يجب أن
   *    يتسابقا مع تجديد الجلسة)
   *  - /api/*   (كل handler يعمل requireUser() بنفسه)
   *  - /audio/* (ملفات mp3 ثابتة — كانت تمر على الـ proxy وتبطئ التشغيل)
   */
  "/((?!_next/static|_next/image|api/|auth/|audio/|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp3|wav|woff2?)$).*)"]

};