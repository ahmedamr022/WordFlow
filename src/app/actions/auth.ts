"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteOrigin } from "@/lib/env/public";
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
  completeOnboardingSchema,
  preferencesSchema,
  placementTestSchema } from
"@/lib/validation/schemas";

export type ActionResult<T = void> =
{ok: true;data?: T;} |
{ok: false;error: string;fieldErrors?: Record<string, string[]>;};

function fail(err: unknown): ActionResult<never> {
  if (err instanceof HttpError) return { ok: false, error: err.message };
  console.error("[action] unhandled", err);
  return { ok: false, error: "حدث خطأ غير متوقع" };
}

// ── Sign up ────────────────────────────────────────────────────────────────

export async function signUpAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();

    const parsed = signUpSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "بيانات غير صالحة",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    await enforceRateLimit("signup", await clientIp(), RATE_LIMITS.signIn);

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { nickname: parsed.data.nickname },
        emailRedirectTo: `${siteOrigin()}/auth/confirm?type=signup`
      }
    });

    // Uniform message: never disclose whether the address already exists.
    if (error) {
      console.error("[signup]", error.message);
      return { ok: false, error: "تعذر إنشاء الحساب، تأكد من البيانات وحاول مرة أخرى" };
    }

    // profiles / user_preferences / user_stats rows are created by the
    // on_auth_user_created trigger.
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ── Sign in ────────────────────────────────────────────────────────────────

export type SignInResult = {redirectTo: string;};

/**
 * Returns the destination computed ON THE SERVER.
 *
 * Before: the action returned void and the login page decided the route in
 * the browser by checking four nullable profile columns. english_level is
 * null for every account that has not finished the level step, so completed
 * users were shipped straight to /onboarding/nickname. That was the bug.
 *
 * After: one flag, profiles.onboarding_completed_at, read server-side, using
 * the exact same rule ProtectedShell enforces.
 */
export async function signInAction(input: unknown): Promise<ActionResult<SignInResult>> {
  try {
    await assertSameOrigin();

    const parsed = signInSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

    await enforceRateLimit("signin:email", parsed.data.email, RATE_LIMITS.signIn);
    await enforceRateLimit("signin:ip", await clientIp(), RATE_LIMITS.signIn);

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password
    });

    if (error || !data.user) {
      return { ok: false, error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }

    const { data: profile } = await supabase.
    from("profiles").
    select("onboarding_completed_at").
    eq("id", data.user.id).
    maybeSingle();

    revalidatePath("/", "layout");

    return {
      ok: true,
      data: { redirectTo: profile?.onboarding_completed_at ? "/dashboard" : "/onboarding" }
    };
  } catch (err) {
    return fail(err);
  }
}

// ── Sign out ───────────────────────────────────────────────────────────────

export async function signOutAction(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "global" });
  revalidatePath("/", "layout");
  redirect("/login");
}

// ── Password recovery ──────────────────────────────────────────────────────

export async function requestPasswordResetAction(input: unknown): Promise<ActionResult> {
  // Always the same answer, whatever happens — no account enumeration.
  const uniform: ActionResult = { ok: true };

  try {
    await assertSameOrigin();

    const parsed = requestPasswordResetSchema.safeParse(input);
    if (!parsed.success) return uniform;

    await enforceRateLimit("pwreset", parsed.data.email, RATE_LIMITS.passwordReset);

    const supabase = await createClient();
    await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${siteOrigin()}/auth/confirm?type=recovery`
    });
  } catch {

    // Swallowed on purpose: any difference in behaviour leaks account existence.
  }
  return uniform;
}

export async function updatePasswordAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    await requireUser(); // the short-lived recovery session

    const parsed = updatePasswordSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "بيانات غير صالحة",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) throw new HttpError(400, "تعذر تحديث كلمة المرور");

    // Invalidate every OTHER session after a password change.
    await supabase.auth.signOut({ scope: "others" });

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ── Profile & settings ─────────────────────────────────────────────────────

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const user = await requireUser();

    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) {
      return {
        ok: false,
        error: "بيانات غير صالحة",
        fieldErrors: parsed.error.flatten().fieldErrors
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", user.id);
    if (error) throw new HttpError(400, "تعذر حفظ البيانات");

    revalidatePath("/profile");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/**
 * The ONLY writer of onboarding_completed_at — the flag every guard reads.
 * It therefore demands the complete answer set.
 */
export async function completeOnboardingAction(input: unknown): Promise<ActionResult> {
  try {
    await assertSameOrigin();

    const user = await requireUser();
    console.log("========== COMPLETE ONBOARDING ==========");
    console.log("USER ID:", user.id);

    const parsed = completeOnboardingSchema.safeParse(input);

    if (!parsed.success) {
      console.error("SCHEMA ERROR:", parsed.error.flatten());

      return {
        ok: false,
        error: "بيانات التسجيل غير مكتملة",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    console.log("PARSED DATA:", parsed.data);

    const supabase = await createClient();

    const profile = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id);

    console.log("PROFILE BEFORE UPDATE:", profile);

    const { data, error } = await supabase
      .from("profiles")
      .update({
        nickname: parsed.data.nickname,
        native_language: parsed.data.native_language,
        country: parsed.data.country,
        english_level: parsed.data.english_level,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select();

    console.log("UPDATE RESULT DATA:", data);
    console.log("UPDATE RESULT ERROR:", error);

    if (error) {
      throw error;
    }

    const profileAfter = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id);

    console.log("PROFILE AFTER UPDATE:", profileAfter);

    revalidatePath("/", "layout");

    console.log("========== COMPLETE SUCCESS ==========");

    return { ok: true };
  } catch (err) {
    console.error("COMPLETE ONBOARDING ERROR:");
    console.error(err);

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

    if (error) throw new HttpError(400, "تعذر حفظ الإعدادات");

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

    const { error: insertError } = await supabase.from("placement_tests").insert({
      user_id: user.id,
      answers: parsed.data.answers,
      score: parsed.data.score,
      resulting_level: parsed.data.resulting_level
    });
    if (insertError) throw new HttpError(400, "تعذر حفظ نتيجة الاختبار");

    const { error: updateError } = await supabase.
    from("profiles").
    update({ english_level: parsed.data.resulting_level }).
    eq("id", user.id);
    if (updateError) throw new HttpError(400, "تعذر تحديث مستواك");

    revalidatePath("/dashboard");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ── Account deletion ───────────────────────────────────────────────────────

/**
 * Before: admin.deleteUser() ran first, then signOut() was attempted with the
 * now-dead user's session — it fails, so the auth cookies stayed in the
 * browser and the app rendered as a phantom logged-in user until the token
 * expired.
 * After: cookies are cleared locally FIRST, then the row is deleted (all
 * tables cascade from auth.users).
 */
export async function deleteAccountAction(): Promise<ActionResult> {
  try {
    await assertSameOrigin();
    const user = await requireUser();

    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" });

    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw new HttpError(400, "تعذر حذف الحساب، تواصل مع الدعم");

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}