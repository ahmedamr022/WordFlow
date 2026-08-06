"use client";

import React, { useMemo, useState, useTransition } from "react";
import { SaveIcon } from "lucide-react";

import { saveSettingsAction } from "@/app/actions/admin/settings";
import { Button, Field, TextInput, Toggle } from "@/components/admin/ui/controls";
import { Panel, Spinner } from "@/components/admin/ui/surfaces";
import type { AdminSetting } from "@/types/admin";

/**
 * إعدادات المنصة.
 *
 * الشكل يُشتق من نوع القيمة نفسها (منطقي → مفتاح، رقم → حقل رقمي، نص → حقل
 * نص) بدل قائمة حقول مكتوبة يدوياً: أي مفتاح جديد يُضاف في SQL يظهر هنا
 * تلقائياً بالشكل الصحيح، بلا تعديل واجهة.
 */

const GROUP_LABELS: Record<string, string> = {
  platform: "المنصة",
  features: "الميزات",
  content: "المحتوى",
  xp: "نقاط الخبرة",
  rules: "قواعد التقييم"
};

type Value = string | number | boolean;

function normalize(value: unknown): Value {
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return value;
  return String(value ?? "");
}

export function SettingsForm({ settings }: {settings: AdminSetting[];}) {
  const initial = useMemo(() => {
    const map: Record<string, Value> = {};
    settings.forEach((setting) => {
      map[setting.key] = normalize(setting.value);
    });
    return map;
  }, [settings]);

  const [values, setValues] = useState<Record<string, Value>>(initial);
  const [message, setMessage] = useState<{tone: "ok" | "error";text: string;} | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = useMemo(
    () => Object.keys(values).some((key) => values[key] !== initial[key]),
    [values, initial]
  );

  const groups = useMemo(() => {
    const map = new Map<string, AdminSetting[]>();
    settings.forEach((setting) => {
      const group = setting.key.split(".")[0];
      map.set(group, [...(map.get(group) ?? []), setting]);
    });
    return Array.from(map.entries());
  }, [settings]);

  const save = () => {
    setMessage(null);
    const changed = Object.keys(values).
    filter((key) => values[key] !== initial[key]).
    map((key) => ({ key, value: values[key] }));

    if (changed.length === 0) return;

    startTransition(async () => {
      const result = await saveSettingsAction(changed);
      setMessage(
        result.ok ?
        { tone: "ok", text: `تم حفظ ${changed.length} إعداد` } :
        { tone: "error", text: result.error }
      );
    });
  };

  if (settings.length === 0) {
    return (
      <Panel title="الإعدادات">
        <p className="text-[12.5px] text-slate-400">
          لا توجد إعدادات بعد. شغّل الهجرة 0015 لإضافة الإعدادات الافتراضية.
        </p>
      </Panel>);

  }

  return (
    <div className="flex flex-col gap-4">
      {message &&
      <p
        role="status"
        className={`rounded-xl border px-3.5 py-2.5 text-[12.5px] font-bold ${
        message.tone === "ok" ?
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" :
        "border-rose-500/30 bg-rose-500/10 text-rose-200"}`
        }>

          {message.text}
        </p>
      }

      {groups.map(([group, entries]) =>
      <Panel key={group} title={GROUP_LABELS[group] ?? group}>
          <div className="flex flex-col gap-4">
            {entries.map((setting) => {
            const value = values[setting.key];

            if (typeof value === "boolean") {
              return (
                <Toggle
                  key={setting.key}
                  label={setting.description || setting.key}
                  description={setting.key}
                  checked={value}
                  onChange={(next) =>
                  setValues({ ...values, [setting.key]: next })
                  } />);


            }

            return (
              <Field
                key={setting.key}
                label={setting.description || setting.key}
                hint={setting.key}
                htmlFor={setting.key}>

                  <TextInput
                  id={setting.key}
                  type={typeof value === "number" ? "number" : "text"}
                  value={String(value)}
                  dir={typeof value === "number" ? "ltr" : undefined}
                  onChange={(event) =>
                  setValues({
                    ...values,
                    [setting.key]:
                    typeof value === "number" ?
                    Number(event.target.value || 0) :
                    event.target.value
                  })
                  } />

                </Field>);

          })}
          </div>
        </Panel>
      )}

      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-[18px] border border-white/[0.07] bg-[#0B111C]/95 px-4 py-3 backdrop-blur">
        <p className="text-[12px] text-slate-400">
          {dirty ? "لديك تغييرات غير محفوظة." : "كل الإعدادات محفوظة."}
        </p>
        <Button tone="primary" onClick={save} disabled={!dirty || pending}>
          {pending ?
          <Spinner label="جارٍ الحفظ" /> :

          <>
              <SaveIcon className="h-4 w-4" aria-hidden />
              حفظ التغييرات
            </>
          }
        </Button>
      </div>
    </div>);

}