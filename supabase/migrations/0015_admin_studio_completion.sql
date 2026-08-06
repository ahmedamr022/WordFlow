-- ============================================================================
-- 0015 — إكمال Admin Studio
-- ============================================================================
-- يكمل ما تحتاجه الصفحات الجديدة (المستخدمون / التقدم / الوسائط / الإعدادات):
--   1. الدور 'suspended' — 0014 حصر role في (user, admin, owner) فلم يكن
--      هناك أي طريقة لتعليق حساب مسيء دون حذفه.
--   2. فهارس القراءة للصفحات الجديدة (كلها ترتّب بـ created_at تنازلياً).
--   3. إعدادات المنصة الافتراضية في app_settings — لتظهر صفحة الإعدادات
--      بقيَم حقيقية من أول تشغيل بدل شاشة فارغة.
-- الملف كله idempotent: تشغيله مرتين لا يغيّر شيئاً.
-- ============================================================================

-- ── 1. تعليق الحسابات ───────────────────────────────────────────────────────
do $$
begin
  if exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles drop constraint profiles_role_check;
  end if;

  alter table public.profiles
    add constraint profiles_role_check
    check (role in ('user', 'admin', 'owner', 'suspended'));
end
$$;

comment on column public.profiles.role is
  'user | admin | owner | suspended — مصدر الصلاحيات وحالة الحساب معاً.';

-- ── 2. فهارس الصفحات الجديدة ────────────────────────────────────────────────
create index if not exists story_media_created_idx
  on public.story_media (created_at desc);

create index if not exists story_media_role_idx
  on public.story_media (role);

create index if not exists admin_activity_action_idx
  on public.admin_activity (action, created_at desc);

create index if not exists profiles_level_idx
  on public.profiles (english_level);

create index if not exists profiles_last_active_idx
  on public.profiles (last_active_at desc nulls last);

create index if not exists user_story_positions_slug_idx
  on public.user_story_positions (story_slug);

-- ── 3. إعدادات المنصة ───────────────────────────────────────────────────────
insert into public.app_settings (key, value, description) values
  ('platform.name',            '"WordFlow"'::jsonb, 'اسم المنصة الظاهر للمستخدمين'),
  ('platform.default_level',   '"B1"'::jsonb,       'المستوى الافتراضي للحساب الجديد'),
  ('platform.support_email',   '""'::jsonb,         'بريد الدعم المعروض في الواجهة'),
  ('features.registration_open','true'::jsonb,      'السماح بإنشاء حسابات جديدة'),
  ('features.story_of_the_day', 'true'::jsonb,      'إظهار قصة اليوم في لوحة المستخدم'),
  ('features.leaderboard',      'true'::jsonb,      'إظهار لوحة المتصدرين'),
  ('content.free_stories_limit','3'::jsonb,         'عدد القصص المجانية قبل الاشتراك')
on conflict (key) do nothing;

-- ── 4. عدّاد مشاهدات القصة (تُستدعى من صفحة القارئ) ─────────────────────────
-- بدونها لا معنى لعمود views في صفحة التحليلات.
create or replace function public.bump_story_views(p_slug text)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update public.stories set views = coalesce(views, 0) + 1 where slug = p_slug;
$$;

grant execute on function public.bump_story_views(text) to authenticated, service_role;
