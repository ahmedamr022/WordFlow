import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && session?.user) {
      // التحقق من وجود حساب المستخدم في database
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, nickname, english_level")
        .eq("id", session.user.id)
        .single();

      // إذا لم يكن البروفايل موجوداً في قاعدة البيانات
      if (!profile) {
        // إنهاء الجلسة حتى لا يظل مسجلاً
        await supabase.auth.signOut();
        const errorMessage = encodeURIComponent("الحساب غير موجود لدينا. يرجى إنشاء حساب جديد أولاً.");
        return NextResponse.redirect(`${origin}/login?error=${errorMessage}`);
      }

      // إذا كان الحساب موجوداً ومكتملاً
      if (profile.nickname && profile.english_level) {
        return NextResponse.redirect(`${origin}/dashboard`);
      }

      // إذا كان الحساب غير مكتمل البيانات يوجه للـ onboarding
      return NextResponse.redirect(`${origin}/onboarding/nickname`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("حدث خطأ أثناء تسجيل الدخول.")}`);
}