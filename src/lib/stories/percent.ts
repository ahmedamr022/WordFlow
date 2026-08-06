/**
 * منطق نسبة التقدم في القصة — مشترك بين السيرفر والعميل.
 *
 * لماذا ملف منفصل؟ لأن ملف `"use server"` لا يُسمح فيه بتصدير أي دالة غير
 * async، فلا يمكن أن تعيش دالة حسابية بحتة داخل actions.
 *
 * القاعدة (المشكلة: «من المعقول إني لما أبدأ من أول جملة يبقى التقدم 17%؟»):
 *   التقدم = الجُمل المكتملة ÷ إجمالي الجُمل. أول جملة = 0%. آخر جملة قبل
 *   إنهائها = (n-1)/n. بعد إنهاء آخر جملة = 100%.
 */

/** نسبة صحيحة 0-100 من عدد الجُمل المكتملة. */
export function positionPercent(linesCompleted: number, totalLines: number): number {
  if (!totalLines || totalLines <= 0) return 0;
  const safeCompleted = Math.min(Math.max(linesCompleted, 0), totalLines);
  return Math.min(100, Math.round(safeCompleted / totalLines * 100));
}

/**
 * نسبة سلسة للعرض أثناء الكتابة: الجُمل المكتملة + جزء الجملة الحالية.
 * تُستخدم في شريط «تقدمك في هذه القصة» فقط حتى يتحرك الشريط أثناء الكتابة،
 * بينما المحفوظ في الداتابيز هو `positionPercent` (جُمل كاملة فقط).
 */
export function livePercent(
linesCompleted: number,
totalLines: number,
lineFraction: number)
: number {
  if (!totalLines || totalLines <= 0) return 0;
  const safeCompleted = Math.min(Math.max(linesCompleted, 0), totalLines);
  const safeFraction = Math.min(Math.max(lineFraction, 0), 1);
  const remaining = totalLines - safeCompleted;
  const value = (safeCompleted + (remaining > 0 ? safeFraction : 0)) / totalLines * 100;
  return Math.min(100, Math.floor(value));
}