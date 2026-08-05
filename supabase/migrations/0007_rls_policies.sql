-- WordFlow · 0007 · Row Level Security
-- الافتراضي هو الرفض. كل سياسة مكتوبة صراحةً. لا استثناء لأي جدول.
-- ---------------------------------------------------------------------------

alter table public.profiles                enable row level security;
alter table public.user_preferences        enable row level security;
alter table public.placement_tests         enable row level security;
alter table public.courses                 enable row level security;
alter table public.stories                 enable row level security;
alter table public.story_lines             enable row level security;
alter table public.vocabulary_categories   enable row level security;
alter table public.words                   enable row level security;
alter table public.category_words          enable row level security;
alter table public.story_line_words        enable row level security;
alter table public.user_story_progress     enable row level security;
alter table public.user_line_attempts      enable row level security;
alter table public.user_word_progress      enable row level security;
alter table public.user_daily_activity     enable row level security;
alter table public.user_stats              enable row level security;
alter table public.xp_events               enable row level security;
alter table public.challenges              enable row level security;
alter table public.user_challenge_progress enable row level security;
alter table public.rate_limits             enable row level security;
alter table public.ai_usage_log            enable row level security;

-- ═══ أ · جداول المحتوى: قراءة للمسجّلين فقط، ولا كتابة إطلاقاً ═════════════
create policy courses_read on public.courses
  for select to authenticated using (is_published);

create policy stories_read on public.stories
  for select to authenticated using (is_published);

create policy story_lines_read on public.story_lines
  for select to authenticated using (
    exists (select 1 from public.stories s where s.id = story_id and s.is_published)
  );

create policy vocab_categories_read on public.vocabulary_categories
  for select to authenticated using (is_published);

create policy words_read on public.words
  for select to authenticated using (true);

create policy category_words_read on public.category_words
  for select to authenticated using (
    exists (select 1 from public.vocabulary_categories c where c.id = category_id and c.is_published)
  );

create policy story_line_words_read on public.story_line_words
  for select to authenticated using (
    exists (
      select 1 from public.story_lines l
      join public.stories s on s.id = l.story_id
      where l.id = line_id and s.is_published
    )
  );

create policy challenges_read on public.challenges
  for select to authenticated using (
    is_active and starts_at <= now() and (ends_at is null or ends_at > now())
  );

-- لا توجد سياسات INSERT/UPDATE/DELETE على أي من الجداول أعلاه.
-- التعديل حصراً عبر service role من سكربت الـ seed.

-- ═══ ب · جداول المستخدم القابلة للكتابة ═══════════════════════════════════
create policy profiles_select on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy profiles_insert on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy profiles_update on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy prefs_select on public.user_preferences
  for select to authenticated using (auth.uid() = user_id);
create policy prefs_insert on public.user_preferences
  for insert to authenticated with check (auth.uid() = user_id);
create policy prefs_update on public.user_preferences
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy placement_select on public.placement_tests
  for select to authenticated using (auth.uid() = user_id);
create policy placement_insert on public.placement_tests
  for insert to authenticated with check (auth.uid() = user_id);

-- ═══ ج · جداول التقدم: قراءة فقط، الكتابة عبر SECURITY DEFINER حصراً ══════
create policy stats_select on public.user_stats
  for select to authenticated using (auth.uid() = user_id);

create policy xp_events_select on public.xp_events
  for select to authenticated using (auth.uid() = user_id);

create policy story_progress_select on public.user_story_progress
  for select to authenticated using (auth.uid() = user_id);

create policy line_attempts_select on public.user_line_attempts
  for select to authenticated using (auth.uid() = user_id);

create policy word_progress_select on public.user_word_progress
  for select to authenticated using (auth.uid() = user_id);

create policy daily_activity_select on public.user_daily_activity
  for select to authenticated using (auth.uid() = user_id);

create policy challenge_progress_select on public.user_challenge_progress
  for select to authenticated using (auth.uid() = user_id);

-- ═══ د · جداول تشغيلية: لا وصول للعميل نهائياً ════════════════════════════
-- rate_limits و ai_usage_log بلا أي سياسة ⇒ مرفوضة بالكامل لغير service role.

-- ═══ صلاحيات المخطط ═══════════════════════════════════════════════════════
revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
