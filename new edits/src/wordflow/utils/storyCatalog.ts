/**
 * WordFlow — story catalog merge with real de-duplication.
 *
 * Replaces the `Map`-keyed-on-id merge inside
 * `src/lib/stories/catalog.ts → listCatalogStories()`.
 *
 * Rules, in order:
 *   1. Match on the canonical slug (`storyIdentityKey`).
 *   2. If that misses, match on a normalised title fingerprint
 *      (English OR Arabic) — this is what catches the current duplicates,
 *      because the DB slug and the hand-written static id diverged.
 *   3. When two records match, the DB row WINS for anything editable
 *      (title, level, lock state, publish date) and the static record is
 *      only used to BACKFILL missing presentation data (cover, description).
 *      That keeps admin edits authoritative without losing the nice
 *      hand-picked artwork.
 *
 * The function also returns the duplicate groups it collapsed, so the admin
 * page can show exactly what happened instead of hiding it.
 */

import type { CatalogStory, DuplicateGroup, StoryItem } from '../types';
import { storyFingerprints, storyIdentityKey } from './identity';

export interface MergeInput {
  /** Hand-authored stories from `src/data/stories.ts`. */
  staticStories: StoryItem[];
  /** Rows already mapped out of Supabase. */
  dbStories: StoryItem[];
  /** Ids/slugs known to have playable content. */
  playableKeys?: string[];
}

export interface MergeResult {
  stories: CatalogStory[];
  duplicates: DuplicateGroup[];
  stats: {
    staticCount: number;
    dbCount: number;
    mergedCount: number;
    collapsedCount: number;
  };
}

function toCatalog(
item: StoryItem,
source: 'static' | 'db',
playable: Set<string>)
: CatalogStory {
  const key = storyIdentityKey(item);
  return {
    ...item,
    id: key,
    slug: key,
    source,
    hasContent: playable.has(key) || playable.has(item.id),
    mergedFrom: [key]
  };
}

/** DB record wins; static record only fills the gaps. */
function coalesce(db: CatalogStory, staticStory: CatalogStory): CatalogStory {
  return {
    ...staticStory,
    ...db,
    cover: db.cover || staticStory.cover,
    descriptionAr: db.descriptionAr || staticStory.descriptionAr,
    titleAr: db.titleAr || staticStory.titleAr,
    titleEn: db.titleEn || staticStory.titleEn,
    progress: db.progress ?? staticStory.progress,
    hasContent: db.hasContent || staticStory.hasContent,
    source: 'db',
    mergedFrom: Array.from(
      new Set([...staticStory.mergedFrom, ...db.mergedFrom])
    )
  };
}

export function mergeStoryCatalog({
  staticStories,
  dbStories,
  playableKeys = []
}: MergeInput): MergeResult {
  const playable = new Set(playableKeys.map((k) => k.toLowerCase()));

  /** canonical key → index in `ordered` */
  const byKey = new Map<string, number>();
  /** title fingerprint → index in `ordered` */
  const byPrint = new Map<string, number>();
  const ordered: CatalogStory[] = [];
  const duplicates = new Map<string, DuplicateGroup>();

  const index = (entry: CatalogStory, position: number) => {
    byKey.set(entry.id, position);
    for (const print of storyFingerprints(entry)) {
      if (!byPrint.has(print)) byPrint.set(print, position);
    }
  };

  const locate = (entry: CatalogStory): number | undefined => {
    const direct = byKey.get(entry.id);
    if (direct !== undefined) return direct;
    for (const print of storyFingerprints(entry)) {
      const hit = byPrint.get(print);
      if (hit !== undefined) return hit;
    }
    return undefined;
  };

  const absorb = (
  entry: CatalogStory,
  reason: DuplicateGroup['reason'])
  : void => {
    const position = locate(entry);

    if (position === undefined) {
      ordered.push(entry);
      index(entry, ordered.length - 1);
      return;
    }

    const existing = ordered[position];
    const kept =
    entry.source === 'db' && existing.source === 'static' ?
    coalesce(entry, existing) :
    existing.source === 'db' && entry.source === 'static' ?
    coalesce(existing, entry) :
    {
      ...existing,
      mergedFrom: Array.from(
        new Set([...existing.mergedFrom, ...entry.mergedFrom])
      )
    };

    ordered[position] = kept;
    index(kept, position);

    const groupKey = kept.id;
    const group = duplicates.get(groupKey);
    if (group) {
      group.shadowed.push(entry);
      group.kept = kept;
    } else {
      duplicates.set(groupKey, {
        key: groupKey,
        reason: byKey.has(entry.id) ? 'slug' : reason,
        kept,
        shadowed: [entry]
      });
    }
  };

  // DB first: it is the editable source of truth.
  for (const row of dbStories) absorb(toCatalog(row, 'db', playable), 'slug');
  // Static second: backfills anything the DB has not caught up with yet.
  for (const item of staticStories)
  absorb(toCatalog(item, 'static', playable), 'title');

  return {
    stories: ordered,
    duplicates: Array.from(duplicates.values()),
    stats: {
      staticCount: staticStories.length,
      dbCount: dbStories.length,
      mergedCount: ordered.length,
      collapsedCount: staticStories.length + dbStories.length - ordered.length
    }
  };
}

/**
 * Finds stories that are duplicated *inside a single source* (two DB rows for
 * the same story, usually created by a re-run of the seed script or the admin
 * "duplicate story" action). Powers the admin cleanup panel.
 */
export function findInternalDuplicates(
stories: CatalogStory[])
: DuplicateGroup[] {
  const seen = new Map<string, CatalogStory>();
  const groups = new Map<string, DuplicateGroup>();

  for (const story of stories) {
    const prints = [story.id, ...storyFingerprints(story)];
    const match = prints.map((p) => seen.get(p)).find(Boolean);

    if (!match) {
      for (const print of prints) seen.set(print, story);
      continue;
    }

    const group = groups.get(match.id);
    if (group) group.shadowed.push(story);else

    groups.set(match.id, {
      key: match.id,
      reason: match.id === story.id ? 'slug' : 'title',
      kept: match,
      shadowed: [story]
    });
  }

  return Array.from(groups.values());
}