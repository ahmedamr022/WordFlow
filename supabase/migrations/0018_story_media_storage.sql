-- WordFlow · 0018 · تخزين صور القصص
-- ---------------------------------------------------------------------------
-- `uploadStoryMediaAction` في src/app/actions/admin/media.ts بيرفع على
-- bucket اسمه "story-media"... لكن الـ bucket ده مش موجود في أي ميجريشن،
-- فكل رفعة بترجع "Bucket not found" — ده سبب إن الأدمن مش قادر يغيّر أي صورة.
--
-- الميجريشن دي:
--   1. تنشئ الـ bucket بحدود النوع والحجم المطابقة للـ Server Action.
--   2. تكتب سياسات storage.objects (قراءة عامة، كتابة للأدمن فقط).
--   3. تفصل صورة الكارت عن صورة خلفية صفحة القراءة داخل stories.appearance
--      بدل ما الاتنين يقرأوا نفس cover_image.
--   4. تفتح story_media للقراءة العامة عشان الواجهة تقدر تجيب صور السلايدشو
--      من الداتابيز بدل ما تخمّن مسارات في public/ (سبب طوفان الـ 404).
--
-- idempotent — تقدر تشغّلها أكثر من مرة.
-- ---------------------------------------------------------------------------

-- ═══ 1 · الـ bucket ════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'story-media',
  'story-media',
  true,
  6291456, -- 6MB — نفس MAX_BYTES في media.ts
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public             = true,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ═══ 2 · سياسات التخزين ════════════════════════════════════════════════════
-- القراءة عامة (الصور تظهر لأي زائر)، والكتابة للأدمن فقط.
-- service_role بيتجاوز RLS، فالـ Server Actions شغالة في كل الحالات.

drop policy if exists "story_media_public_read"   on storage.objects;
drop policy if exists "story_media_admin_insert"  on storage.objects;
drop policy if exists "story_media_admin_update"  on storage.objects;
drop policy if exists "story_media_admin_delete"  on storage.objects;

create policy "story_media_public_read"
  on storage.objects for select
  using (bucket_id = 'story-media');

create policy "story_media_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'story-media' and public.is_admin());

create policy "story_media_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'story-media' and public.is_admin())
  with check (bucket_id = 'story-media' and public.is_admin());

create policy "story_media_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'story-media' and public.is_admin());

-- ═══ 3 · story_media: قراءة للواجهة ════════════════════════════════════════
-- 0014 عمل policy `story_media_read ... using (true)` لكن من غير GRANT،
-- فالجدول كان مقفول فعلياً على authenticated (نفس بق 0017).

grant select on table public.story_media to authenticated;
grant select on table public.story_versions to service_role;

create index if not exists story_media_role_story_idx
  on public.story_media (story_id, role, sort_order);

-- upsert في scripts/sync-story-images.ts بيعتمد على المفتاح ده،
-- ومن غيره كل تشغيلة كانت هتضيف نسخة مكرّرة من نفس الصورة.
create unique index if not exists story_media_story_url_key
  on public.story_media (story_id, url);

-- ═══ 4 · فصل صورة الكارت عن خلفية صفحة القراءة ═════════════════════════════
-- شكل appearance المتوقَّع من src/lib/stories/appearance.ts:
--   { storyPage: {...}, modal: {...}, storyToday: {...}, card: {...} }
-- كل سطح له imageUrl مستقل. القصص القديمة كان appearance عندها '{}' فكانت
-- كل الأسطح ترجع للـ fallback نفسه ⇒ نفس الصورة في كل مكان.

-- الكارت ⇐ cover_image
update public.stories s
   set appearance = coalesce(s.appearance, '{}'::jsonb)
     || jsonb_build_object(
          'card',
          coalesce(s.appearance -> 'card', '{}'::jsonb)
            || jsonb_build_object('imageUrl', s.cover_image)
        )
 where s.cover_image is not null
   and btrim(s.cover_image) <> ''
   and coalesce(s.appearance -> 'card' ->> 'imageUrl', '') = '';

-- صفحة القراءة ⇐ bg_image، وإن لم توجد فالغلاف
update public.stories s
   set appearance = coalesce(s.appearance, '{}'::jsonb)
     || jsonb_build_object(
          'storyPage',
          coalesce(s.appearance -> 'storyPage', '{}'::jsonb)
            || jsonb_build_object('imageUrl', coalesce(s.bg_image, s.cover_image))
        )
 where coalesce(s.bg_image, s.cover_image) is not null
   and btrim(coalesce(s.bg_image, s.cover_image)) <> ''
   and coalesce(s.appearance -> 'storyPage' ->> 'imageUrl', '') = '';

-- المودال وقصة اليوم ⇐ الغلاف كبداية، والأدمن يغيّرهم من الاستوديو
update public.stories s
   set appearance = coalesce(s.appearance, '{}'::jsonb)
     || jsonb_build_object(
          'modal',
          coalesce(s.appearance -> 'modal', '{}'::jsonb)
            || jsonb_build_object('imageUrl', coalesce(s.bg_image, s.cover_image)),
          'storyToday',
          coalesce(s.appearance -> 'storyToday', '{}'::jsonb)
            || jsonb_build_object('imageUrl', coalesce(s.bg_image, s.cover_image))
        )
 where coalesce(s.bg_image, s.cover_image) is not null
   and btrim(coalesce(s.bg_image, s.cover_image)) <> '';

-- ═══ 5 · تسجيل الصور الحالية في مكتبة الوسائط ══════════════════════════════
-- عشان تظهر في /admin/media وفي تبويب «الوسائط» داخل الاستوديو.

insert into public.story_media (story_id, url, role, sort_order)
select s.id, s.cover_image, 'cover', 0
  from public.stories s
 where s.cover_image is not null
   and btrim(s.cover_image) <> ''
   and not exists (
     select 1 from public.story_media m
      where m.story_id = s.id and m.url = s.cover_image
   );

insert into public.story_media (story_id, url, role, sort_order)
select s.id, s.bg_image, 'background', 1
  from public.stories s
 where s.bg_image is not null
   and btrim(s.bg_image) <> ''
   and not exists (
     select 1 from public.story_media m
      where m.story_id = s.id and m.url = s.bg_image
   );

notify pgrst, 'reload schema';
