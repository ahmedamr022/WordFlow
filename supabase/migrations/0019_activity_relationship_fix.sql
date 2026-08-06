-- ═══════════════════════════════════════════════════════════════════════════
-- 0019_activity_relationship_fix.sql
--
-- الغرض: إنهاء PGRST201 نهائياً.
--
--   [admin:activity] "PGRST201"
--   Could not embed because more than one relationship was found
--   for 'admin_activity' and 'actor_id'
--
-- السبب الحقيقي: على الداتابيز المنشورة لسه فيه **أكثر من مفتاح أجنبي** على
-- `admin_activity.actor_id`. ميجريشن 0017 كان بيحذف بس المفاتيح اللي
-- `confrelid = auth.users`، فأي مفتاح قديم بأي اسم تانٍ (أو مفتاح اتضاف
-- مرتين) بيفضل موجود. PostgREST لما يلاقي مسارين من `actor_id` بيرفض الـ
-- embed كله ويرجّع 201.
--
-- الحل هنا مش بالاسم: بنلف على **كل** مفتاح أجنبي على العمود ونحذفه، ثم
-- نضيف مفتاحاً واحداً باسم صريح. الاسم الصريح مهم لأن الكود بقى يستخدمه
-- كـ hint (شوف wordflow/PATCHES.md) فالمشكلة ما ترجعش تاني أبداً.
--
-- idempotent: شغّله أكثر من مرة بأمان.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 1) عمود واحد ⇒ مفتاح أجنبي واحد باسم واحد معروف.
-- ───────────────────────────────────────────────────────────────────────────
do $$
declare
  target record;
  con    record;
  reg    regclass;
  refreg regclass;
begin
  for target in
    select *
      from (values
        ('admin_activity', 'actor_id',   'profiles', 'id', 'admin_activity_actor_id_profiles_fkey'),
        ('story_versions', 'created_by', 'profiles', 'id', 'story_versions_created_by_profiles_fkey'),
        ('story_media',    'created_by', 'profiles', 'id', 'story_media_created_by_profiles_fkey')
      ) as t(tbl, col, ref_tbl, ref_col, con_name)
  loop
    reg    := to_regclass('public.' || target.tbl);
    refreg := to_regclass('public.' || target.ref_tbl);

    if reg is null or refreg is null then
      continue;
    end if;

    if not exists (
      select 1 from information_schema.columns
       where table_schema = 'public'
         and table_name   = target.tbl
         and column_name  = target.col
    ) then
      continue;
    end if;

    -- (أ) نضّف الصفوف اليتيمة قبل الربط، وإلا ALTER بيفشل.
    execute format(
      'update public.%I set %I = null
         where %I is not null
           and not exists (select 1 from public.%I r where r.%I = public.%I.%I)',
      target.tbl, target.col, target.col,
      target.ref_tbl, target.ref_col, target.tbl, target.col
    );

    -- (ب) احذف كل مفتاح أجنبي على العمود — بأي اسم وأي جدول مرجعي.
    for con in
      select c.conname
        from pg_constraint c
       where c.conrelid = reg
         and c.contype  = 'f'
         and exists (
           select 1 from pg_attribute a
            where a.attrelid = c.conrelid
              and a.attnum   = any (c.conkey)
              and a.attname  = target.col
         )
    loop
      execute format('alter table public.%I drop constraint %I', target.tbl, con.conname);
    end loop;

    -- (ج) مفتاح واحد نظيف باسم صريح.
    execute format(
      'alter table public.%I
         add constraint %I foreign key (%I)
         references public.%I (%I) on delete set null',
      target.tbl, target.con_name, target.col, target.ref_tbl, target.ref_col
    );
  end loop;
end $$;

-- ───────────────────────────────────────────────────────────────────────────
-- 2) نفس المرض ممكن يظهر في stories → categories لو المفتاح اتضاف مرتين.
--    نسيب الأقدم ونحذف المكرّر (بلا لمس الاسم الأصلي).
-- ───────────────────────────────────────────────────────────────────────────
do $$
declare
  keeper text;
  con    record;
begin
  if to_regclass('public.stories') is null or to_regclass('public.categories') is null then
    return;
  end if;

  select c.conname into keeper
    from pg_constraint c
   where c.conrelid  = 'public.stories'::regclass
     and c.contype   = 'f'
     and c.confrelid = 'public.categories'::regclass
   order by c.oid asc
   limit 1;

  if keeper is null then return; end if;

  for con in
    select c.conname
      from pg_constraint c
     where c.conrelid  = 'public.stories'::regclass
       and c.contype   = 'f'
       and c.confrelid = 'public.categories'::regclass
       and c.conname  <> keeper
  loop
    execute format('alter table public.stories drop constraint %I', con.conname);
  end loop;
end $$;

-- ───────────────────────────────────────────────────────────────────────────
-- 3) تأكيد الصلاحيات (تكرار مقصود لـ 0017 لو حد شغّله على فرع قديم).
-- ───────────────────────────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'admin_activity', 'story_versions', 'story_media',
    'stories', 'categories', 'profiles'
  ]
  loop
    if to_regclass('public.' || t) is not null then
      execute format('grant select on public.%I to authenticated, service_role', t);
      execute format('grant insert, update, delete on public.%I to service_role', t);
    end if;
  end loop;
end $$;

grant usage on schema public to anon, authenticated, service_role;

-- ───────────────────────────────────────────────────────────────────────────
-- 4) أهم سطرين في الملف: إعادة تحميل كاش المخطط في PostgREST.
--    بدونهم الخطأ يفضل ظاهر بعد الميجريشن لأن PostgREST لسه شايف
--    العلاقات القديمة في الكاش.
-- ───────────────────────────────────────────────────────────────────────────
notify pgrst, 'reload schema';
notify pgrst, 'reload config';

-- ───────────────────────────────────────────────────────────────────────────
-- 5) تحقّق: لازم مفتاح واحد بالظبط على admin_activity.actor_id.
-- ───────────────────────────────────────────────────────────────────────────
do $$
declare n integer;
begin
  select count(*) into n
    from pg_constraint c
    join pg_attribute a
      on a.attrelid = c.conrelid
     and a.attnum   = any (c.conkey)
   where c.conrelid = 'public.admin_activity'::regclass
     and c.contype  = 'f'
     and a.attname  = 'actor_id';

  if n <> 1 then
    raise exception '0019: admin_activity.actor_id عليه % مفتاح أجنبي (المتوقع 1)', n;
  end if;

  raise notice '0019: تم — admin_activity.actor_id عليه مفتاح واحد فقط.';
end $$;
