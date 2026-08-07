# WordFlow — دليل الدمج في المشروع

كل الأكواد داخل هذا الفولدر جاهزة للنسخ. ما تحتاجه هو نقل الملفات إلى مشروع
Next.js وتعديل الاستيرادات فقط — المنطق كله framework-agnostic.

---

## 1) خريطة الملفات → مشروعك

| هذا الفولدر | مكانه في مشروعك |
| --- | --- |
| `types/index.ts` | `src/types/vocabulary.ts` (ادمجه مع `src/types/index.ts`) |
| `utils/identity.ts` | `src/lib/content/identity.ts` ← **مهم جداً** |
| `utils/storyCatalog.ts` | يستبدل منطق الدمج داخل `src/lib/stories/catalog.ts` |
| `utils/srs.ts` | `src/lib/vocabulary/srs.ts` |
| `utils/icons.ts` | `src/lib/vocabulary/icons.ts` |
| `hooks/useVocabulary.tsx` | `src/components/providers/vocabulary-provider.tsx` |
| `hooks/useReviewSession.ts` | `src/hooks/useReviewSession.ts` |
| `hooks/useSpeech.ts` | `src/hooks/useSpeech.ts` |
| `components/ui/*` | `src/components/ui/*` |
| `components/vocabulary/*` | `src/components/vocabulary/*` |
| `components/review/*` | `src/components/vocabulary/review/*` |
| `components/admin/*` | `src/components/admin/*` |
| `pages/WordsPage.tsx` | `src/app/vocabulary/VocabularyPageClient.tsx` |
| `pages/CategoryPage.tsx` | `src/app/vocabulary/[categoryId]/CategoryPageClient.tsx` |
| `pages/AdminPage.tsx` | `src/app/admin/page.tsx` (+ الأقسام) |

### تعديلات Next.js المطلوبة
1. أضف `"use client"` في أعلى كل ملف يستخدم hooks أو `framer-motion`.
2. استبدل `react-router-dom`:
   - `<Link to="...">` → `next/link` `<Link href="...">`
   - `useParams()` → `useParams()` من `next/navigation`
   - `useNavigate()` → `useRouter()` من `next/navigation` (`router.push`)
3. الألوان في `tailwind.config.js` هنا مطابقة لتوكنات `globals.css` عندك
   (`--color-brand-teal` … إلخ)، فاستخدم توكناتك مباشرة بدل إضافة config جديد
   لأن مشروعك على Tailwind v4.

---

## 2) حذف صفحة الكلمة المنفصلة

الصفحة `src/app/vocabulary/[categoryId]/[wordId]/page.tsx` لم تعد مطلوبة:
تفاصيل الكلمة تُعرض الآن في `WordDetailPanel` داخل اللوحة اليمنى (وفي
`WordDetailSheet` على الشاشات الصغيرة).

**ما تكسبه:** لا تنقّل بين الصفحات، لا إعادة جلب بيانات، لا فقدان لموضع
التمرير أو الفلاتر، وتنقّل بالسهمين ↑ ↓ بين الكلمات مباشرة.

إن أردت الاحتفاظ بالرابط للمشاركة (deep link): أبقِ المسار موجوداً لكن اجعله
يعيد التوجيه إلى `/vocabulary/[categoryId]?word=[wordId]`، وفي
`CategoryPageClient` اقرأ `searchParams.word` لتفتح اللوحة تلقائياً.

---

## 3) حل مشكلة تكرار القصص (الأهم)

### السبب الحقيقي
لديك ثلاثة مولّدات هوية مختلفة لنفس القصة:

1. `src/data/stories.ts` → مُعرّفات مكتوبة يدوياً (`"titanic-legend"`).
2. `scripts/seed-content.ts` → `slugify()` نسخة أولى.
3. `src/lib/admin/draft.ts` → `slugify()` نسخة ثانية + لاحقة عشوائية.

ثم `listCatalogStories()` كان يدمج بـ `Map<string, CatalogStory>` بمفتاح
`id` (وللصفوف القادمة من القاعدة `id = row.slug`). فأي اختلاف بحرف واحد بين
الـ slug في القاعدة والـ id الثابت ينتج **مفتاحين** ⇒ نفس القصة تظهر مرتين.

### الحل بثلاث طبقات

**الطبقة 1 — هوية موحّدة (منع التكرار من الأساس)**
استخدم `toSlug()` من `utils/identity.ts` في كل مكان يُولّد فيه slug: سكربت
الـ seed، لوحة التحكم، والبيانات الثابتة. دالة واحدة deterministic ⇒ إعادة
تشغيل الـ seed لا تُنشئ صفاً جديداً أبداً.

```ts
// scripts/seed-content.ts و src/lib/admin/draft.ts
import { toSlug } from "@/lib/content/identity";
const slug = story.slug ?? toSlug(story.titleEn ?? story.title);
```

**الطبقة 2 — دمج ذكي وقت القراءة (يعالج البيانات الموجودة الآن)**
استبدل جسم `listCatalogStories()` بـ `mergeStoryCatalog()`:

```ts
import { mergeStoryCatalog } from "./merge";

export async function listCatalogStories() {
  const rows = await fetchPublishedRows();
  const { stories } = mergeStoryCatalog({
    staticStories: [...MAIN_STORIES, ...RECOMMENDED_STORIES_DATA],
    dbStories: rows.map(rowToCatalog),
    playableKeys: [...STATIC_PLAYABLE],
  });
  return stories;
}
```

المطابقة تتم على: المُعرّف الموحّد ← ثم العنوان الإنجليزي أو العربي بعد
**التطبيع العربي** (إزالة التشكيل، توحيد أ/إ/آ/ا، ى/ي، ة/ه). صف القاعدة يفوز
دائماً في الحقول القابلة للتعديل، والقصة الثابتة تُكمل الناقص فقط (الغلاف،
الوصف) حتى لا تفقد الصور المختارة يدوياً.

**الطبقة 3 — تنظيف قاعدة البيانات + قيد تفرّد (حتى لا تعود)**
تبويب «التكرارات» في لوحة التحكم يعرض كل مجموعة مكررة وأي نسخة ستبقى. بعد
التنظيف نفّذ:

```sql
-- 1) انقل تقدم القراءة إلى الصف الأقدم (النسخة التي ستبقى)
with canonical as (
  select min(created_at) as created_at, lower(title_en) as key
  from public.stories where deleted_at is null group by lower(title_en)
),
keep as (
  select s.id, s.slug, lower(s.title_en) as key
  from public.stories s
  join canonical c on c.key = lower(s.title_en) and c.created_at = s.created_at
)
update public.user_story_positions p
set story_slug = k.slug
from public.stories s
join keep k on k.key = lower(s.title_en)
where p.story_slug = s.slug and s.slug <> k.slug;

-- 2) أرشف الصفوف الزائدة (حذف ناعم، لا حذف نهائي)
update public.stories s set deleted_at = now()
where s.deleted_at is null
  and exists (
    select 1 from public.stories o
    where o.deleted_at is null
      and lower(o.title_en) = lower(s.title_en)
      and o.created_at < s.created_at
  );

-- 3) امنع التكرار مستقبلاً
create unique index if not exists stories_slug_unique
  on public.stories (slug) where deleted_at is null;

create unique index if not exists stories_title_unique
  on public.stories (lower(title_en)) where deleted_at is null;
```

> نفّذ الخطوة 1 قبل 2 دائماً، وإلا يفقد المتعلمون تقدّمهم في النسخة المحذوفة.

**إضافة مهمة في لوحة التحكم:** زر «تكرار قصة» يجب أن يستخدم
`toSlug(`${title} copy`)` مرة واحدة ويعطي عنواناً مختلفاً بوضوح، وإلا فسيقع في
نفس فخ تطابق العناوين.

---

## 4) منطق المراجعة الجديد

- `utils/srs.ts` يطبّق SM-2 مبسّط: كل تقدير يحدّث `ease` و`intervalDays`
  و`nextReviewAt` و`mastery` بدل إعطاء نقاط فقط.
- التقديرات الأربعة: `known` / `almost` / `hard` / `forgot` بعناوين
  أعرفها / تقريباً / صعبة / لا أتذكرها.
- الحالة مشتقة دائماً: `new → learning → due → mastered`، فلا يمكن أن تختلف
  صفحة الكلمات عن اللوحة عن المودل.
- البطاقة تبدأ **بالمعنى مخفياً** (استرجاع ذاتي أولاً) ثم تُكشف بمسافة أو
  بالزر — أزرار التقدير معطّلة قبل الكشف حتى لا تُغش النتيجة.
- اختصارات: مسافة = كشف، 1–4 = تقدير، ← = تأجيل الكلمة لآخر الطابور.
- `recordWordReviewByTextAction` عندك: استدعِ `gradeWord()` على الخادم لأنها
  دالة نقية، واحفظ الناتج في `user_word_progress` (`status`,
  `last_reviewed_at`, `next_review_at`, وأضف `ease`, `interval_days`,
  `mastery`).
