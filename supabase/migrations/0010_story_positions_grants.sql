-- ============================================================================
-- 0010_story_positions_grants.sql
--
-- المشكلة التي يحلّها هذا الملف:
--   [stories:overview] user_story_positions "42501" "permission denied for table
--   user_story_positions"
--
-- 42501 ليس خطأ RLS. سياسات RLS لو منعت صفاً ترجّع "لا نتائج" لا "permission
-- denied". الرسالة دي معناها إن الـ GRANT على مستوى الجدول نفسه ناقص لدور
-- `authenticated`. السبب: `0007_rls_policies.sql` ينتهي بـ
--   revoke all on all tables in schema public from anon;
--   grant usage on schema public to authenticated;
-- ولم يمنح أي صلاحية جدول لـ authenticated، وجدول 0009 أُنشئ *بعد* ذلك فلم
-- يورث أي منح.
--
-- النتيجة كانت: كل قراءة للموقع تفشل ⇒ القارئ يبدأ من أول جملة دائماً،
-- والمودال يقول «ابدأ القصة»، واللوحة الجانبية لا ترى أي قصة بدأتها — رغم أن
-- الكتابة (RPC بـ service_role) كانت تنجح فعلاً.
--
-- التطبيق:
--   supabase db push        (أو نفّذ هذا الملف من SQL Editor)
-- ============================================================================

grant usage on schema public to authenticated;

-- الجدول: قراءة/كتابة صفوف المستخدم نفسه فقط (RLS هي من تفرض ذلك، والمنح
-- هنا هو مفتاح الدخول للجدول من الأساس).
grant select, insert, update on table public.user_story_positions to authenticated;
grant all    on table public.user_story_positions to service_role;
revoke all   on table public.user_story_positions from anon;

-- تأكيد أن RLS مفعّلة والسياسات موجودة (idempotent — آمن للتشغيل المتكرر).
alter table public.user_story_positions enable row level security;

drop policy if exists "own positions readable" on public.user_story_positions;
create policy "own positions readable"
  on public.user_story_positions for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "own positions insertable" on public.user_story_positions;
create policy "own positions insertable"
  on public.user_story_positions for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "own positions updatable" on public.user_story_positions;
create policy "own positions updatable"
  on public.user_story_positions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- الدالة الذرّية (تأكيد المنح — لو 0009 نُفِّذ جزئياً).
grant execute on function public.upsert_story_position(uuid, text, int, int, int, numeric, numeric, int, boolean) to service_role;
grant execute on function public.upsert_story_position(uuid, text, int, int, int, numeric, numeric, int, boolean) to authenticated;

-- ولأي جدول مستخدم يُضاف مستقبلاً في هذا المخطط: لا تنسَ GRANT بجانب RLS.
