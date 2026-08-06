"use client";

import { useEffect, useRef } from "react";
import { importLocalProgressAction } from "@/app/actions/migrate";
import { readLegacyProgress, purgeLegacyStorage } from "@/lib/storage/legacyKeys";

/**
 * يعمل مرة واحدة بعد الدخول: ينقل تقدم المستخدم القديم من المتصفح إلى السيرفر
 * بمنطق «الأعلى يفوز»، ثم يمسح كل مفاتيح localStorage القديمة نهائياً.
 *
 * ضعه داخل layout المنطقة المحمية (مثلاً src/app/(app)/layout.tsx) أو في
 * صفحة الداشبورد. لا يعرض أي واجهة.
 */
export function LegacyProgressMigrator() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const legacy = readLegacyProgress();
    if (!legacy) return;

    void importLocalProgressAction(legacy).
    then((result) => {
      // الحذف يتم في الحالتين: النجاح، أو أن الهجرة تمت سابقاً.
      if (result.ok) purgeLegacyStorage();
    }).
    catch(() => {

      // نتركه للمحاولة التالية بدل فقدان التقدم.
    });}, []);

  return null;
}