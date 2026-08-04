import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // قائمة المسارات المحمية داخل التطبيق
  const protectedRoutes = [
    "/dashboard",
    "/profile",
    "/settings",
    "/stories",
    "/stories-list",
    "/story",
    "/vocabulary",
    "/stats",
    "/challenges",
    "/paths",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 1. حماية صفحة الـ Dashboard والصفحات الرئيسية
  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // التحقق من حالة الـ Onboarding
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, country, native_language, english_level")
      .eq("id", user.id)
      .single();

    if (
      !profile ||
      !profile.nickname ||
      !profile.country ||
      !profile.native_language ||
      !profile.english_level
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding/nickname";
      return NextResponse.redirect(url);
    }
  }

  // 2. حماية صفحات الـ Onboarding (يجب تسجيل الدخول للوصول لها)
  if (pathname.startsWith("/onboarding")) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, country, native_language, english_level")
      .eq("id", user.id)
      .single();

    // لو أتم الـ Onboarding وسجل كل بياناته، يوجه فوراً للـ Dashboard
    if (
      profile &&
      profile.nickname &&
      profile.country &&
      profile.native_language &&
      profile.english_level
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/stories/:path*",
    "/stories-list/:path*",
    "/story/:path*",
    "/vocabulary/:path*",
    "/stats/:path*",
    "/challenges/:path*",
    "/paths/:path*",
  ],
};