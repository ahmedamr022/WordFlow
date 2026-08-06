-- ============================================================================
-- 0014 — WordFlow Admin Studio
-- ============================================================================
-- يضيف كل ما تحتاجه لوحة الأدمن:
--   · profiles.role            → من هو الأدمن (لم يكن هناك أي دور في المشروع).
--   · categories              → تصنيفات قابلة للإدارة بدل نصوص ثابتة.
--   · stories.appearance      → إعدادات عرض الصورة لكل سطح (jsonb).
--   · stories.access/status   → القفل والنشر والمسودة.
--   · stories.draft           → Draft → Preview → Publish.
--   · story_media             → مكتبة وسائط لكل قصة.
--   · story_versions          → تاريخ الإصدارات + الاستعادة.
--   · admin_activity          → سجل الأحداث.
-- كل الكتابة للأدمن فقط عبر RLS + دالة is_admin().
-- ============================================================================

-- ── 1. الأدوار ──────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists last_active_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_role_check check (role in ('user', 'admin', 'owner'));
  end if;
end
$$;

create index if not exists profiles_role_idx on public.profiles (role)
  where role <> 'user';

create or replace function public.is_admin(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = p_user_id and role in ('admin', 'owner')
  );
$$;

grant execute on function public.is_admin(uuid) to authenticated, service_role;

-- ── 2. التصنيفات ────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_ar text not null,
  description_ar text not null default '',
  icon text not null default 'BookOpen',
  color text not null default '#22d3ee',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.categories (slug, name_en, name_ar, icon, color, sort_order)
values
  ('history',   'History',   'تاريخ',       'Landmark',  '#f5b82e', 1),
  ('mystery',   'Mystery',   'غموض',        'Search',    '#8b5cf6', 2),
  ('romance',   'Romance',   'رومانسية',    'Heart',     '#ff4f70', 3),
  ('adventure', 'Adventure', 'مغامرة',      'Compass',   '#22e0c8', 4),
  ('classic',   'Classic',   'أدب كلاسيكي', 'BookOpen',  '#60a5fa', 5),
  ('fantasy',   'Fantasy',   'خيال',        'Sparkles',  '#c084fc', 6),
  ('science',   'Science',   'علوم',        'Atom',      '#34d399', 7)
on conflict (slug) do nothing;

-- ── 3. أعمدة القصة الجديدة ──────────────────────────────────────────────────
alter table public.stories
  add column if not exists category_id uuid references public.categories (id) on delete set null,
  add column if not exists difficulty text not null default 'intermediate',
  add column if not exists status text not null default 'published',
  add column if not exists access jsonb not null default
    '{"locked": false, "lockType": "visible", "lockMessage": "هذه القصة غير متاحة حالياً"}'::jsonb,
  add column if not exists appearance jsonb not null default '{}'::jsonb,
  add column if not exists seo jsonb not null default '{}'::jsonb,
  add column if not exists draft jsonb,
  add column if not exists views integer not null default 0,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_by uuid references auth.users (id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'stories_status_check') then
    alter table public.stories
      add constraint stories_status_check check (status in ('published', 'draft', 'locked'));
  end if;
end
$$;

-- مزامنة الأعمدة القديمة مع الجديدة مرة واحدة.
update public.stories
set status = case
               when (access ->> 'locked')::boolean is true then 'locked'
               when is_published is false then 'draft'
               else 'published'
             end
where status = 'published' and is_published is false;

create index if not exists stories_status_idx on public.stories (status)
  where deleted_at is null;
create index if not exists stories_category_idx on public.stories (category_id);

-- ── 3.b أعمدة الجُمل ────────────────────────────────────────────────────────
-- المفردات كانت تحتاج ٣ جداول (words + story_line_words) لكل كلمة، وهذا ثقيل
-- ومربك في محرّر الجُمل. للتحرير نخزّن قائمة الكلمات المهمة للجملة كـ jsonb،
-- وجداول القاموس تبقى كما هي للمراجعة والمفردات.
alter table public.story_lines
  add column if not exists level text,
  add column if not exists vocabulary jsonb not null default '[]'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'story_lines_story_line_unique'
  ) then
    alter table public.story_lines
      add constraint story_lines_story_line_unique unique (story_id, line_index);
  end if;
end
$$;

-- ── 4. مكتبة الوسائط ────────────────────────────────────────────────────────
create table if not exists public.story_media (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories (id) on delete cascade,
  url text not null,
  role text not null default 'scene',
  width integer,
  height integer,
  bytes integer,
  mime text,
  sort_order integer not null default 0,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint story_media_role_check
    check (role in ('cover', 'background', 'scene', 'modal'))
);

create index if not exists story_media_story_idx
  on public.story_media (story_id, sort_order);

-- ── 5. تاريخ الإصدارات ──────────────────────────────────────────────────────
create table if not exists public.story_versions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories (id) on delete cascade,
  version integer not null,
  snapshot jsonb not null,
  summary text not null default '',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (story_id, version)
);

create index if not exists story_versions_story_idx
  on public.story_versions (story_id, version desc);

create or replace function public.next_story_version(p_story_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(max(version), 0) + 1
  from public.story_versions
  where story_id = p_story_id;
$$;

-- ── 6. سجل أحداث الأدمن ─────────────────────────────────────────────────────
create table if not exists public.admin_activity (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  label text not null default '',
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_created_idx
  on public.admin_activity (created_at desc);

-- ── 7. RLS ──────────────────────────────────────────────────────────────────
alter table public.categories enable row level security;
alter table public.story_media enable row level security;
alter table public.story_versions enable row level security;
alter table public.admin_activity enable row level security;

drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories
  for select using (is_active or public.is_admin());

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists story_media_read on public.story_media;
create policy story_media_read on public.story_media
  for select using (true);

drop policy if exists story_media_admin_write on public.story_media;
create policy story_media_admin_write on public.story_media
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists story_versions_admin on public.story_versions;
create policy story_versions_admin on public.story_versions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists admin_activity_admin on public.admin_activity;
create policy admin_activity_admin on public.admin_activity
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 8. إحصاءات لوحة التحكم في استدعاء واحد ──────────────────────────────────
create or replace function public.admin_overview_stats()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total',       (select count(*) from public.stories where deleted_at is null),
    'published',   (select count(*) from public.stories where deleted_at is null and status = 'published'),
    'locked',      (select count(*) from public.stories where deleted_at is null and status = 'locked'),
    'drafts',      (select count(*) from public.stories where deleted_at is null and status = 'draft'),
    'newThisWeek', (select count(*) from public.stories
                    where deleted_at is null and created_at > now() - interval '7 days'),
    'activeUsers', (select count(*) from public.profiles
                    where last_active_at > now() - interval '7 days'),
    'readers',     (select count(distinct user_id) from public.user_story_positions),
    'completed',   (select count(*) from public.user_story_positions where completed_at is not null),
    'positions',   (select count(*) from public.user_story_positions),
    'avgSeconds',  (select coalesce(round(avg(time_spent_seconds)), 0)
                    from public.user_story_positions where time_spent_seconds > 0)
  );
$$;

grant execute on function public.admin_overview_stats() to service_role;

-- ── 9. مساحة تخزين الوسائط ──────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('story-media', 'story-media', true)
on conflict (id) do nothing;

drop policy if exists "story media public read" on storage.objects;
create policy "story media public read" on storage.objects
  for select using (bucket_id = 'story-media');

drop policy if exists "story media admin write" on storage.objects;
create policy "story media admin write" on storage.objects
  for all using (bucket_id = 'story-media' and public.is_admin())
  with check (bucket_id = 'story-media' and public.is_admin());
