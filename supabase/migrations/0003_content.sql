-- WordFlow · 0003 · المحتوى (المنقول من src/data/*.ts)
-- courses · stories · story_lines · vocabulary_categories · words
-- category_words · story_line_words
-- ---------------------------------------------------------------------------

create table if not exists public.courses (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title_en     text not null,
  title_ar     text not null,
  description_ar text,
  cefr_level   cefr_level not null default 'A1',
  cover_image  text,
  sort_order   int not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
select public.attach_updated_at('courses');

create table if not exists public.stories (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  course_id         uuid references public.courses(id) on delete set null,
  title_en          text not null,
  title_ar          text not null,
  description_ar    text,
  description_en    text,
  cefr_level        cefr_level not null default 'A1',
  cover_image       text,
  bg_image          text,
  total_lines       int not null default 0 check (total_lines >= 0),
  total_words       int not null default 0 check (total_words >= 0),
  estimated_minutes int not null default 5 check (estimated_minutes > 0),
  xp_reward         int not null default 50 check (xp_reward >= 0),
  sort_order        int not null default 0,
  is_published      boolean not null default false,
  is_premium        boolean not null default false, -- عمود جاهز للمستقبل، مقفول على false
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists stories_course_idx on public.stories(course_id, sort_order);
create index if not exists stories_level_idx  on public.stories(cefr_level) where is_published;
select public.attach_updated_at('stories');

create table if not exists public.story_lines (
  id             uuid primary key default gen_random_uuid(),
  story_id       uuid not null references public.stories(id) on delete cascade,
  line_index     int  not null check (line_index >= 0),
  text           text not null,
  translation_ar text,
  audio_url      text,
  char_count     int generated always as (char_length(text)) stored,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (story_id, line_index)
);
create index if not exists story_lines_story_idx on public.story_lines(story_id, line_index);
select public.attach_updated_at('story_lines');

create table if not exists public.vocabulary_categories (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title_ar       text not null,
  title_en       text not null,
  description_ar text,
  icon           text,
  cover_image    text,
  sort_order     int not null default 0,
  is_published   boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
select public.attach_updated_at('vocabulary_categories');

-- القاموس المركزي: مفتاح موحّد يمنع ازدواج نفس الكلمة بين القصص والتصنيفات
create table if not exists public.words (
  id             uuid primary key default gen_random_uuid(),
  word           text not null,
  normalized     text generated always as (lower(btrim(word))) stored,
  translation_ar text not null,
  ipa            text,
  part_of_speech text not null default 'unknown',
  cefr_level     cefr_level not null default 'A1',
  example_en     text,
  example_ar     text,
  audio_url      text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (normalized, part_of_speech)
);
create index if not exists words_trgm_idx on public.words using gin (normalized gin_trgm_ops);
create index if not exists words_level_idx on public.words(cefr_level);
select public.attach_updated_at('words');

create table if not exists public.category_words (
  category_id uuid not null references public.vocabulary_categories(id) on delete cascade,
  word_id     uuid not null references public.words(id) on delete cascade,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  primary key (category_id, word_id)
);
create index if not exists category_words_word_idx on public.category_words(word_id);

create table if not exists public.story_line_words (
  line_id    uuid not null references public.story_lines(id) on delete cascade,
  word_index int  not null check (word_index >= 0),
  word_id    uuid not null references public.words(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (line_id, word_index)
);
create index if not exists story_line_words_word_idx on public.story_line_words(word_id);

-- إبقاء stories.total_lines متسقاً مع الواقع بدل الاعتماد على الـ seed
create or replace function public.refresh_story_totals()
returns trigger language plpgsql as $$
declare target uuid;
begin
  target := coalesce(new.story_id, old.story_id);
  update public.stories s
     set total_lines = (select count(*) from public.story_lines l where l.story_id = target),
         total_words = (
           select coalesce(sum(array_length(regexp_split_to_array(btrim(l.text), '\s+'), 1)), 0)
           from public.story_lines l where l.story_id = target
         )
   where s.id = target;
  return null;
end;
$$;

drop trigger if exists refresh_story_totals on public.story_lines;
create trigger refresh_story_totals
  after insert or update or delete on public.story_lines
  for each row execute function public.refresh_story_totals();
