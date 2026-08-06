import "server-only";

/**
 * استدعاء RPC غير موجود بعد في `src/types/database.ts`.
 *
 * الدوال المضافة في 0016 (`record_word_review_by_text`,
 * `record_line_attempt_by_slug`, `complete_story_by_slug`) لن تظهر في الأنواع
 * المولَّدة إلا بعد إعادة توليدها من Supabase. بدل تعطيل TypeScript بـ `any`
 * في كل موضع استدعاء، نحصر التحويل في مكان واحد موثّق بتوقيع صريح.
 *
 * بعد إعادة توليد الأنواع (`supabase gen types typescript`) يمكن استبدال
 * `rpcAny(admin, "…", {…})` بـ `admin.rpc("…", {…})` وحذف هذا الملف.
 */

export interface RpcError {
  message: string;
  code?: string;
}

export interface RpcResponse<T = unknown> {
  data: T | null;
  error: RpcError | null;
}

type RpcCapableClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<RpcResponse<unknown>>;
};

export async function rpcAny<T = unknown>(
client: unknown,
fn: string,
args: Record<string, unknown>)
: Promise<RpcResponse<T>> {
  const result = await (client as RpcCapableClient).rpc(fn, args);
  return result as RpcResponse<T>;
}