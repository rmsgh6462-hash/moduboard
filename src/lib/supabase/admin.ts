import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/**
 * Service Role 클라이언트 — 학생 일괄 생성 등 서버 전용.
 * 브라우저에 노출하면 안 됩니다.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다. Supabase Dashboard → Settings → API에서 service_role 키를 복사하세요.",
    );
  }

  return createClient<Database>(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
