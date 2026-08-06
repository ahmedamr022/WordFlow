-- ============================================================================
-- 0009_story_positions.sql
--
-- المشكلة:
--   `user_story_progress.story_id` من نوع uuid ومرتبط بجدول `stories`، بينما
--   الواجهة كلها تتعامل مع معرّفات نصية (slug) قادمة من `src/data/stories.ts`
--   مثل "titanic-legend". لذلك كان مستحيلاً حفظ "أين وصل المستخدم في القصة"
--   وكانت نسبة التقدم في كل الشاشات أرقاماً مكتوبة في الكود.
--
-- الحل:
--   جدول موقع قراءة مستقل بمفتاح نصي (slug) يعمل قبل وبعد ترحيل المحتوى
--   إلى الداتابيز، + دالة ذرّية واحدة للكتابة (رحلة واحدة، وتحفظ الأفضل).
--
-- التطبيق:
--   supabase db push        (أو نفّذ الملف من SQL Editor)
-- ============================================================================

create table if not exists public.user_story_positions (
  user_id            uuid        not null references auth.users (id) on delete cascade,
  story_slug         text        not null,
  line_index         int         not null default 0 check (line_index >= 0),
  lines_completed    int         not null default 0 check (lines_completed >= 0),
  total_lines        int         not null default 0 check (total_lines >= 0),
  best_accuracy      numeric(5,2)         check (best_accuracy is null or (best_accuracy >= 0 and best_accuracy <= 100)),
  best_wpm           numeric(6,2)         check (best_wpm is null or best_wpm >= 0),
  time_spent_seconds int         not null default 0 check (time_spent_seconds >= 0),
  completed_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  primary key (user_id, story_slug)
);

comment on table public.user_story_positions is
  'موقع القراءة الحقيقي لكل مستخدم في كل قصة (بمعرّف نصي). مصدر نسبة التقدم في كل الشاشات.';

create index if not exists user_story_positions_user_updated_idx
  on public.user_story_positions (user_id, updated_at desc);

alter table public.user_story_positions enable row level security;

-- المستخدم يقرأ صفوفه فقط. الكتابة تمر من الدالة أدناه (server action).
drop policy if exists "own positions readable" on public.user_story_positions;
create policy "own positions readable"
  on public.user_story_positions for select
  using (auth.uid() = user_id);

drop policy if exists "own positions insertable" on public.user_story_positions;
create policy "own positions insertable"
  on public.user_story_positions for insert
  with check (auth.uid() = user_id);

drop policy if exists "own positions updatable" on public.user_story_positions;
create policy "own positions updatable"
  on public.user_story_positions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- كتابة ذرّية واحدة:
--   · line_index      → آخر موقع فعلي (يتراجع لو رجع المستخدم لجملة سابقة)
--   · lines_completed → الأعلى فقط (لا يتراجع التقدم المحقَّق)
--   · best_accuracy / best_wpm → الأفضل فقط
--   · time_spent_seconds → تراكمي
-- ----------------------------------------------------------------------------
create or replace function public.upsert_story_position(
  p_user_id        uuid,
  p_story_slug     text,
  p_line_index     int,
  p_lines_completed int,
  p_total_lines    int,
  p_accuracy       numeric default null,
  p_wpm            numeric default null,
  p_seconds        int     default 0,
  p_completed      boolean default false
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_story_positions as p (
    user_id, story_slug, line_index, lines_completed, total_lines,
    best_accuracy, best_wpm, time_spent_seconds, completed_at
  )
  values (
    p_user_id,
    p_story_slug,
    greatest(coalesce(p_line_index, 0), 0),
    greatest(coalesce(p_lines_completed, 0), 0),
    greatest(coalesce(p_total_lines, 0), 0),
    p_accuracy,
    p_wpm,
    greatest(coalesce(p_seconds, 0), 0),
    case when p_completed then now() else null end
  )
  on conflict (user_id, story_slug) do update set
    line_index      = greatest(coalesce(excluded.line_index, 0), 0),
    lines_completed = greatest(p.lines_completed, excluded.lines_completed),
    total_lines     = case when excluded.total_lines > 0 then excluded.total_lines else p.total_lines end,
    best_accuracy   = case
                        when excluded.best_accuracy is null then p.best_accuracy
                        else greatest(coalesce(p.best_accuracy, 0), excluded.best_accuracy)
                      end,
    best_wpm        = case
                        when excluded.best_wpm is null then p.best_wpm
                        else greatest(coalesce(p.best_wpm, 0), excluded.best_wpm)
                      end,
    time_spent_seconds = p.time_spent_seconds + excluded.time_spent_seconds,
    completed_at    = coalesce(p.completed_at, excluded.completed_at),
    updated_at      = now();
end;
$$;

revoke all on function public.upsert_story_position(uuid, text, int, int, int, numeric, numeric, int, boolean) from public;
grant execute on function public.upsert_story_position(uuid, text, int, int, int, numeric, numeric, int, boolean) to service_role;
grant execute on function public.upsert_story_position(uuid, text, int, int, int, numeric, numeric, int, boolean) to authenticated;
