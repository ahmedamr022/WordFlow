import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * تغييران عن النسخة الحالية:
 *  1) لا استعلام قاعدة بيانات على profiles في كل طلب — علم اكتمال الـ onboarding
 *     يُقرأ من app_metadata داخل الـ JWT مباشرة (يكتبه trigger sync_onboarding_claim).
 *  2) خصائص الكوكيز مشدّدة صراحةً بدل الاعتماد على الافتراضيات.
 */

const PROTECTED_PREFIXES = [
"/dashboard",
"/stories",
"/story",
"/vocabulary",
"/practice",
"/stats",
"/challenges",
"/profile",
"/settings",
"/onboarding"];


const AUTH_ONLY_PAGES = ["/login", "/signup", "/forgot-password"];

const SECURE_COOKIE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/"
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, { ...options, ...SECURE_COOKIE })
          );
        }
      }
    }
  );

  // تجديد الجلسة — لا تحذف هذا السطر ولا تضع أي كود بينه وبين الإرجاع
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && AUTH_ONLY_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // اكتمال الـ onboarding من الـ JWT — بدون أي رحلة للداتابيز
  if (user && isProtected && pathname !== "/onboarding") {
    const done = user.app_metadata?.onboarding_completed === true;
    if (!done) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav)$).*)"]
};