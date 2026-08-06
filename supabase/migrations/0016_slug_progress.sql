-- WordFlow · 0016 · ربط التقدّم بالمحتوى الثابت (slug/text) بدل UUID فقط
-- ---------------------------------------------------------------------------
-- لماذا هذه الهجرة موجودة؟
--
-- المحتوى الحقيقي للتطبيق ما زال في `src/data/*.ts` (قصص بمعرّفات نصية مثل
-- "the-ship"، وكلمات بمعرّفات مثل "tr1"). أما دوال التقدّم في 0006 فتطلب
-- UUID من `stories` / `story_lines` / `words`.
--
-- النتيجة العملية قبل هذه الهجرة:
--   · `record_line_attempt` و `complete_story` لا يمكن استدعاؤهما أصلاً من
--     صفحة القراءة ⇒ لا XP، ولا `user_story_progress`، ولا محاولات مسجّلة.
--   · `record_word_review` يفشل لأي كلمة لم يُدخلها سكربت الـ seed ⇒ رسالة
--     «هذه الكلمة غير موجودة في قاعدة البيانات بعد» ⇒ لا شيء يُحفظ.
--
-- الحل هنا: طبقة «ensure» ترفع المحتوى الثابت إلى الداتابيز عند أول تفاعل
-- حقيقي من المستخدم (lazy provisioning)، ثم تنادي نفس دوال 0006 بلا تغيير في
-- منطق الـ XP أو الحواجز. لا ازدواج: المفتاح الفريد هو نفسه
-- (`words.normalized + part_of_speech`, `stories.slug`, `story_lines.line_index`).
-- ---------------------------------------------------------------------------

-- ── كلمة: أرجِع معرّفها، وأنشئها إن لم تكن موجودة ─────────────────────────
create or replace function public.ensure_word(
  p_word           text,
  p_part_of_speech text default 'unknown',
  p_translation_ar text default null,
  p_ipa            text default null,
  p_cefr           text default 'A1',
  p_example_en     text default null,
  p_example_ar     text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_norm  text := lower(btrim(coalesce(p_word, '')));
  v_pos   text := coalesce(nullif(btrim(coalesce(p_part_of_speech, '')), ''), 'unknown');
  v_level cefr_level;
  v_id    uuid;
begin
  if v_norm = '' then
    raise exception 'empty_word';
  end if;

  v_level := case
               when upper(coalesce(p_cefr, '')) in ('A1','A2','B1','B2','C1','C2')
                 then upper(p_cefr)::cefr_level
               else 'A1'::cefr_level
             end;

  select id into v_id
    from public.words
   where normalized = v_norm and part_of_speech = v_pos
   limit 1;

  if v_id is not null then
    -- نُكمل الحقول الناقصة فقط؛ لا نكتب فوق محتوى حرّره الأدمن.
    update public.words
       set translation_ar = case
                              when coalesce(btrim(translation_ar), '') in ('', '—')
                                then coalesce(nullif(btrim(coalesce(p_translation_ar,'')), ''), translation_ar)
                              else translation_ar
                            end,
           ipa            = coalesce(ipa, nullif(btrim(coalesce(p_ipa,'')), '')),
           example_en     = coalesce(example_en, nullif(btrim(coalesce(p_example_en,'')), '')),
           example_ar     = coalesce(example_ar, nullif(btrim(coalesce(p_example_ar,'')), ''))
     where id = v_id;
    return v_id;
  end if;

  insert into public.words
    (word, translation_ar, ipa, part_of_speech, cefr_level, example_en, example_ar)
  values
    (btrim(p_word),
     coalesce(nullif(btrim(coalesce(p_translation_ar,'')), ''), '—'),
     nullif(btrim(coalesce(p_ipa,'')), ''),
     v_pos,
     v_level,
     nullif(btrim(coalesce(p_example_en,'')), ''),
     nullif(btrim(coalesce(p_example_ar,'')), ''))
  on conflict (normalized, part_of_speech) do nothing
  returning id into v_id;

  if v_id is null then      -- سباق متزامن: صفّ آخر سبقنا
    select id into v_id
      from public.words
     where normalized = v_norm and part_of_speech = v_pos
     limit 1;
  end if;

  return v_id;
end;
$$;

-- ── مراجعة كلمة بالنص (الجسر الذي تستخدمه واجهة /vocabulary) ──────────────
create or replace function public.record_word_review_by_text(
  p_user_id        uuid,
  p_word           text,
  p_part_of_speech text default 'unknown',
  p_correct        boolean default true,
  p_translation_ar text default null,
  p_ipa            text default null,
  p_cefr           text default 'A1',
  p_example_en     text default null,
  p_example_ar     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_word_id uuid;
  v_result  jsonb;
begin
  v_word_id := public.ensure_word(
    p_word, p_part_of_speech, p_translation_ar, p_ipa, p_cefr, p_example_en, p_example_ar
  );

  if v_word_id is null then
    raise exception 'word_provision_failed';
  end if;

  v_result := public.record_word_review(p_user_id, v_word_id, p_correct);
  return v_result || jsonb_build_object('word_id', v_word_id);
end;
$$;

-- ── قصة: أرجِع معرّفها، وأنشئها إن لم تكن موجودة ──────────────────────────
create or replace function public.ensure_story(
  p_slug        text,
  p_title_en    text default null,
  p_title_ar    text default null,
  p_cefr        text default 'A1',
  p_xp_reward   int  default 50
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug  text := lower(btrim(coalesce(p_slug, '')));
  v_level cefr_level;
  v_id    uuid;
begin
  if v_slug = '' then
    raise exception 'empty_story_slug';
  end if;

  v_level := case
               when upper(coalesce(p_cefr, '')) in ('A1','A2','B1','B2','C1','C2')
                 then upper(p_cefr)::cefr_level
               else 'A1'::cefr_level
             end;

  select id into v_id from public.stories where slug = v_slug limit 1;
  if v_id is not null then
    -- قصة موجودة لكنها غير منشورة تمنع complete_story من العمل.
    update public.stories set is_published = true where id = v_id and is_published = false;
    return v_id;
  end if;

  insert into public.stories (slug, title_en, title_ar, cefr_level, xp_reward, is_published)
  values (v_slug,
          coalesce(nullif(btrim(coalesce(p_title_en,'')), ''), v_slug),
          coalesce(nullif(btrim(coalesce(p_title_ar,'')), ''), v_slug),
          v_level,
          greatest(coalesce(p_xp_reward, 50), 0),
          true)
  on conflict (slug) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id from public.stories where slug = v_slug limit 1;
  end if;

  return v_id;
end;
$$;

-- ── سطر قصة: أرجِع معرّفه، وأنشئه/زامنه مع نص المحتوى الثابت ──────────────
create or replace function public.ensure_story_line(
  p_story_id       uuid,
  p_line_index     int,
  p_text           text,
  p_translation_ar text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id      uuid;
  v_current text;
begin
  if p_text is null or btrim(p_text) = '' then
    raise exception 'empty_line_text';
  end if;

  select id, text into v_id, v_current
    from public.story_lines
   where story_id = p_story_id and line_index = greatest(p_line_index, 0)
   limit 1;

  if v_id is not null then
    -- مهم: `record_line_attempt` تقارن عدد الحروف بـ char_count المحسوب من
    -- هذا العمود. لو اختلف النص عمّا كتبه المستخدم فعلاً تُرفض كل محاولة
    -- بسبب char_count_mismatch. لذلك نزامن النص مع مصدر المحتوى الحيّ.
    if btrim(v_current) is distinct from btrim(p_text) then
      update public.story_lines
         set text           = btrim(p_text),
             translation_ar = coalesce(nullif(btrim(coalesce(p_translation_ar,'')), ''), translation_ar)
       where id = v_id;
    end if;
    return v_id;
  end if;

  insert into public.story_lines (story_id, line_index, text, translation_ar)
  values (p_story_id, greatest(p_line_index, 0), btrim(p_text),
          nullif(btrim(coalesce(p_translation_ar,'')), ''))
  on conflict (story_id, line_index) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id
      from public.story_lines
     where story_id = p_story_id and line_index = greatest(p_line_index, 0)
     limit 1;
  end if;

  return v_id;
end;
$$;

-- ── محاولة سطر بالـ slug (ما تستدعيه صفحة القراءة بعد كل جملة) ────────────
create or replace function public.record_line_attempt_by_slug(
  p_user_id        uuid,
  p_story_slug     text,
  p_line_index     int,
  p_line_text      text,
  p_translation_ar text default null,
  p_story_title_en text default null,
  p_story_title_ar text default null,
  p_cefr           text default 'A1',
  p_wpm            numeric default 0,
  p_accuracy       numeric default 100,
  p_correct        int default 0,
  p_incorrect      int default 0,
  p_seconds        numeric default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_story_id uuid;
  v_line_id  uuid;
begin
  v_story_id := public.ensure_story(
    p_story_slug, p_story_title_en, p_story_title_ar, p_cefr, 50
  );
  if v_story_id is null then raise exception 'story_provision_failed'; end if;

  v_line_id := public.ensure_story_line(
    v_story_id, p_line_index, p_line_text, p_translation_ar
  );
  if v_line_id is null then raise exception 'line_provision_failed'; end if;

  return public.record_line_attempt(
    p_user_id, v_line_id, p_wpm, p_accuracy,
    greatest(coalesce(p_correct, 0), 0),
    greatest(coalesce(p_incorrect, 0), 0),
    greatest(coalesce(p_seconds, 1), 0.01)
  );
end;
$$;

-- ── إنهاء قصة بالـ slug ───────────────────────────────────────────────────
create or replace function public.complete_story_by_slug(
  p_user_id        uuid,
  p_story_slug     text,
  p_story_title_en text default null,
  p_story_title_ar text default null,
  p_cefr           text default 'A1'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_story_id uuid;
begin
  v_story_id := public.ensure_story(
    p_story_slug, p_story_title_en, p_story_title_ar, p_cefr, 50
  );
  if v_story_id is null then raise exception 'story_provision_failed'; end if;

  return public.complete_story(p_user_id, v_story_id);
end;
$$;

-- كما في 0006: لا تُستدعى من العميل مباشرة، فقط عبر Server Actions بمفتاح الخدمة.
revoke all on function public.ensure_word(text,text,text,text,text,text,text)
  from public, anon, authenticated;
revoke all on function public.ensure_story(text,text,text,text,int)
  from public, anon, authenticated;
revoke all on function public.ensure_story_line(uuid,int,text,text)
  from public, anon, authenticated;
revoke all on function public.record_word_review_by_text(uuid,text,text,boolean,text,text,text,text,text)
  from public, anon, authenticated;
revoke all on function public.record_line_attempt_by_slug(uuid,text,int,text,text,text,text,text,numeric,numeric,int,int,numeric)
  from public, anon, authenticated;
revoke all on function public.complete_story_by_slug(uuid,text,text,text,text)
  from public, anon, authenticated;
