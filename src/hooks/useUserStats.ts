"use client";

import { useCallback, useEffect, useState } from "react";
import { getUserStatsAction, getDailyActivityAction } from "@/app/actions/stats";
import { DEFAULT_USER_STATS } from "@/lib/userStats";
import type { UserStats, DailyActivityPoint } from "@/lib/userStats";

/**
 * ما تغيّر:
 *  · `enabled` — لتفادي الطلب أصلاً في الشاشات التي تقرأ البيانات على
 *    السيرفر وتمرّرها props (الداشبورد الآن كذلك).
 *  · `initial` — قيمة أولية من السيرفر، فلا يوجد وميض skeleton ولا
 *    أصفار وهمية في أول رسم.
 *  · إلغاء صحيح للطلب (`active`) في useUserStats أيضاً — قبلها كان
 *    `refresh` يعمل setState بعد unmount.
 */
export function useUserStats(options?: {enabled?: boolean;initial?: UserStats;}) {
  const enabled = options?.enabled ?? true;
  const initial = options?.initial;

  const [stats, setStats] = useState<UserStats>(initial ?? DEFAULT_USER_STATS);
  const [isLoading, setIsLoading] = useState(enabled && !initial);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getUserStatsAction();
      setStats(data ?? DEFAULT_USER_STATS);
      setError(null);
    } catch {
      setError("تعذر تحميل إحصائياتك");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    let active = true;
    void (async () => {
      try {
        const data = await getUserStatsAction();
        if (active) {
          setStats(data ?? DEFAULT_USER_STATS);
          setError(null);
        }
      } catch {
        if (active) setError("تعذر تحميل إحصائياتك");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled]);

  return { stats, isLoading, error, refresh };
}

export function useDailyActivity(
days = 10,
options?: {enabled?: boolean;initial?: DailyActivityPoint[];})
{
  const enabled = options?.enabled ?? true;
  const [points, setPoints] = useState<DailyActivityPoint[]>(options?.initial ?? []);
  const [isLoading, setIsLoading] = useState(enabled && !options?.initial);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    let active = true;
    getDailyActivityAction(days).
    then((data) => {
      if (active) setPoints(data);
    }).
    catch(() => {
      if (active) setPoints([]);
    }).
    finally(() => {
      if (active) setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [days, enabled]);

  return { points, isLoading };
}