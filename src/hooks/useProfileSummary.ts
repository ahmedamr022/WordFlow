"use client";

import { useCallback, useEffect, useState } from "react";
import { getProfileSummaryAction } from "@/app/actions/stats";
import type { ProfileSummary } from "@/app/actions/stats";

/**
 * أُضيف `enabled` لأن الهوك كان يُنفَّذ في كل هيدر حتى عندما يكون الأب
 * قد قرأ نفس البيانات على السيرفر بالفعل — طلب شبكة كامل (مع getUser)
 * مقابل صفر معلومات جديدة. الصفحات المهاجَرة تمرّر enabled: false.
 */
export function useProfileSummary(options?: {enabled?: boolean;}) {
  const enabled = options?.enabled ?? true;

  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setProfile(await getProfileSummaryAction());
      setError(null);
    } catch {
      setError("تعذر تحميل بيانات حسابك");
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
        const data = await getProfileSummaryAction();
        if (active) {
          setProfile(data);
          setError(null);
        }
      } catch {
        if (active) setError("تعذر تحميل بيانات حسابك");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [enabled]);

  return { profile, isLoading, error, refresh };
}