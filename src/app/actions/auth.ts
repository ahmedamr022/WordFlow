"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env";
import {
  HttpError,
  requireUser,
  assertSameOrigin,
  enforceRateLimit,
  clientIp,
  RATE_LIMITS } from
"@/lib/auth/guards";
import {
  signUpSchema,
  signInSchema,
  requestPasswordResetSchema,
  updatePasswordSchema,
  profileSchema,
  preferencesSchema,
  placementTestSchema } from
"@/lib/validation/schemas";

export type ActionResult<T = void> =
{ok: true;data?: T;} |
{ok: false;error: string;fieldErrors?: Record<string, string[]>;};

function fail(err: unknown): ActionResult<never> {
  if (err instanceof HttpError) return { ok: false, error: err.message };
  if (err instanceof Error) return { ok: false, error: err.message };
  return { ok: false, error: "حدث خطأ غير متوقع" };
}

// ── تسجيل حساب جديد ────────────────────────────────────────────────────────
export async function signUpAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const parsed = signUpSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "بيانات غير صالحة", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    await enforceRateLimit("signup", await clientIp(), RATE_LIMITS.signIn);

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { nickname: parsed.data.nickname },
        emailRedirectTo: `${publicEnv().NEXT_PUBLIC_SITE_URL}/auth/confirm`
      }
    });
    if (error) throw new HttpError(400, error.message);

    // صف profiles/user_preferences/user_stats يُنشأ تلقائياً عبر trigger on_auth_user_created
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ── تسجيل الدخول ───────────────────────────────────────────────────────────
export async function signInAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const parsed = signInSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

    // حد لكل إيميل + IP معاً
    await enforceRateLimit("signin:email", parsed.data.email, RATE_LIMITS.signIn);
    await enforceRateLimit("signin:ip", await clientIp(), RATE_LIMITS.signIn);

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    // رسالة موحّدة: لا نكشف إن كان الإيميل مسجّلاً أم لا
    if (error) return { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ── تسجيل خروج حقيقي (يستبدل مسح localStorage الوهمي) ──────────────────────
export async function signOutAction(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  revalidatePath("/", "layout");
  redirect("/login");
}

// ── استعادة كلمة المرور ────────────────────────────────────────────────────
export async function requestPasswordResetAction(input: unknown): Promise<ActionResult> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  // رسالة نجاح موحّدة دائماً — منع تعداد الحسابات
  const uniform: ActionResult = { ok: true };
  if (!parsed.success) return uniform;

  try {
    await enforceRateLimit("pwreset", parsed.data.email, RATE_LIMITS.passwordReset);
    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${publicEnv().NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/reset-password`
    });
  } catch {

    // نبتلع الخطأ عمداً حتى لا يتسرّب وجود الحساب من عدمه
  }return uniform;
}

export async function updatePasswordAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    await requireUser(); // الجلسة المؤقتة من رابط الاستعادة
    const parsed = updatePasswordSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "بيانات غير صالحة", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) throw new HttpError(400, error.message);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ── البروفايل والإعدادات ───────────────────────────────────────────────────
export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "بيانات غير صالحة", fieldErrors: parsed.error.flatten().fieldErrors };
    }
    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
    if (error) throw new HttpError(400, error.message);
    revalidatePath("/profile");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function completeOnboardingAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

    const supabase = await createClient();
    const { error } = await supabase.
    from("profiles").
    update({ ...parsed.data, onboarding_completed_at: new Date().toISOString() }).
    eq("id", user.id);
    if (error) throw new HttpError(400, error.message);

    // trigger sync_onboarding_claim يكتب العلم في app_metadata؛ نحدّث الجلسة ليظهر في الـ JWT
    await supabase.auth.refreshSession();
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function updatePreferencesAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = preferencesSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "إعدادات غير صالحة" };

    const supabase = await createClient();
    const { error } = await supabase.
    from("user_preferences").
    upsert({ user_id: user.id, ...parsed.data }, { onConflict: "user_id" });
    if (error) throw new HttpError(400, error.message);
    revalidatePath("/settings");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function savePlacementTestAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const parsed = placementTestSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "نتيجة اختبار غير صالحة" };

    const supabase = await createClient();
    const { error } = await supabase.from("placement_tests").insert({
      user_id: user.id,
      answers: parsed.data.answers,
      score: parsed.data.score,
      resulting_level: parsed.data.resulting_level
    });
    if (error) throw new HttpError(400, error.message);

    await supabase.
    from("profiles").
    update({ english_level: parsed.data.resulting_level }).
    eq("id", user.id);

    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ── حذف الحساب بالكامل (التزام الخصوصية) ───────────────────────────────────
export async function deleteAccountAction(): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const user = await requireUser();
    const admin = createAdminClient();
    // كل الجداول عليها ON DELETE CASCADE من auth.users
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw new HttpError(400, error.message);

    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" });
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}