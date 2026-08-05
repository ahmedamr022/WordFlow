import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * النسخة القديمة كانت تعمل signOut لأي مستخدم OAuth بلا صف profiles —
 * أي أن كل مستخدم جديد بجوجل كان مسدوداً تماماً.
 *
 * الآن الـ trigger on_auth_user_created يضمن وجود الصف لحظة إنشاء الحساب،
 * فيبقى دور هذا الراوت مجرد تبادل الكود ثم التوجيه.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const { data: profile } = await supabase.
  from("profiles").
  select("onboarding_completed_at").
  eq("id", data.user.id).
  maybeSingle();

  const destination = profile?.onboarding_completed_at ? "/dashboard" : "/onboarding";
  return NextResponse.redirect(`${origin}${destination}`);
}