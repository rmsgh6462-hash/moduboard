/**
 * Dashboard Project URL만 사용합니다.
 * `.../rest/v1` 같은 API 경로가 붙으면 Auth가 404가 납니다.
 */
export function getSupabaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  if (!raw) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.");
  }

  const normalized = raw
    .replace(/\/+$/, "")
    .replace(/\/rest\/v1$/i, "")
    .replace(/\/auth\/v1$/i, "")
    .replace(/\/storage\/v1$/i, "");

  return normalized;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.");
  }
  return key;
}
