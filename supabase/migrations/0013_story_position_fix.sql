-- ============================================================================
-- 0013 — إصلاح فقدان موقع القراءة («مش بيتم حفظ الجملة»)
-- ============================================================================
-- السبب الجذري:
--   في 0009 كان التحديث:
--       line_index = greatest(coalesce(excluded.line_index, 0), 0)
--   أي أن **أي** استدعاء يكتب فوق الموقع المحفوظ، بينما lines_completed
--   و best_accuracy محميّة بـ greatest(p.*, excluded.*).
--   والواجهة ترسل حفظين متقاربين لكل انتقال (واحد عند إكمال الجملة بالدقة،
--   وواحد مؤجَّل 700ms بدون دقة). لو وصل المؤجَّل الأقدم بعد الأحدث، رجع
--   line_index للخلف. وأسوأ حالة: عند فتح القصة والموقع المحفوظ = آخر جملة،
--   الواجهة كانت تتخطى الاستئناف ثم تحفظ 0 → الموقع يُمحى تماماً.
--
-- الإصلاح هنا (نصف الحل، والنصف الثاني في صفحة القارئ):
--   · p_index_source = 'auto'   → line_index لا يرجع للخلف أبداً.
--   · p_index_source = 'manual' → الأدمن/المستخدم رجع بنفسه، نحترم القيمة.
--   · p_index_source = 'reset'  → إعادة القصة من أولها (زر «ابدأ من جديد»).
-- ============================================================================

-- إسقاط كل تحميلات الدالة القديمة بالاسم (التوقيع تغيّر بإضافة معامل جديد،
-- ولو تُركت النسخة القديمة تصبح مناداة الـ RPC غامضة/ambiguous).
do $$
declare
  fn record;
begin
  for fn in
    select oid::regprocedure as sig
    from pg_proc
    where proname = 'upsert_story_position'
      and pronamespace = 'public'::regnamespace
  loop
    execute format('drop function %s', fn.sig);
  end loop;
end
$$;

create or replace function public.upsert_story_position(
  p_user_id uuid,
  p_story_slug text,
  p_line_index integer,
  p_lines_completed integer,
  p_total_lines integer,
  p_accuracy numeric default null,
  p_wpm numeric default null,
  p_seconds integer default 0,
  p_completed boolean default false,
  p_index_source text default 'auto'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source text := coalesce(nullif(p_index_source, ''), 'auto');
begin
  insert into public.user_story_positions as p (
    user_id,
    story_slug,
    line_index,
    lines_completed,
    total_lines,
    best_accuracy,
    best_wpm,
    time_spent_seconds,
    completed_at,
    updated_at
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
    case when p_completed then now() else null end,
    now()
  )
  on conflict (user_id, story_slug) do update set
    line_index =
      case
        when v_source = 'reset' then 0
        when v_source = 'manual' then greatest(coalesce(excluded.line_index, 0), 0)
        -- 'auto': لا رجوع للخلف مهما كان ترتيب وصول الطلبات.
        else greatest(p.line_index, coalesce(excluded.line_index, 0), 0)
      end,
    lines_completed = greatest(p.lines_completed, excluded.lines_completed),
    total_lines     = greatest(p.total_lines, excluded.total_lines),
    best_accuracy   = case
                        when excluded.best_accuracy is null then p.best_accuracy
                        else greatest(coalesce(p.best_accuracy, 0), excluded.best_accuracy)
                      end,
    best_wpm        = case
                        when excluded.best_wpm is null then p.best_wpm
                        else greatest(coalesce(p.best_wpm, 0), excluded.best_wpm)
                      end,
    time_spent_seconds = p.time_spent_seconds + excluded.time_spent_seconds,
    completed_at    = case
                        when v_source = 'reset' then null
                        when p_completed then coalesce(p.completed_at, now())
                        else p.completed_at
                      end,
    updated_at      = now();
end
$$;

revoke all on function public.upsert_story_position(
  uuid, text, integer, integer, integer, numeric, numeric, integer, boolean, text
) from public;

grant execute on function public.upsert_story_position(
  uuid, text, integer, integer, integer, numeric, numeric, integer, boolean, text
) to service_role;

comment on function public.upsert_story_position is
  'حفظ ذرّي لموقع القراءة. line_index لا يرجع للخلف إلا بطلب صريح (manual/reset).';
