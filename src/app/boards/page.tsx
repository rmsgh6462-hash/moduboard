import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Board } from "@/types/database";

export default async function BoardsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const groupId = profile.group_id ?? profile.group?.id ?? null;

  let boards: Board[] = [];
  if (groupId) {
    const { data } = await supabase
      .from("boards")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });
    boards = data ?? [];
  }

  const groupLabel = profile.group
    ? `${profile.group.school_name} ${profile.group.grade}학년 ${profile.group.class_num}반`
    : "소속 학급 없음";

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        name={profile.name}
        roleLabel={profile.role === "teacher" ? "교사" : "학생"}
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-[calc(2rem+var(--safe-bottom))]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">내 보드</h1>
          <p className="mt-1 text-sm text-muted">{groupLabel}</p>
        </div>

        {profile.role === "teacher" ? (
          <Link
            href="/teacher"
            className="touch-target inline-flex items-center justify-center rounded-2xl border border-border bg-surface px-4 text-sm font-semibold"
          >
            학급·학생 관리로 이동
          </Link>
        ) : null}

        {!groupId ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
            {profile.role === "teacher"
              ? "아직 학급 그룹이 없습니다. 교사용 페이지에서 그룹을 만들어 주세요."
              : "아직 학급에 배정되지 않았습니다. 선생님께 계정 등록을 요청해 주세요."}
          </div>
        ) : boards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm text-muted">
            열린 보드가 없습니다.
            {profile.role === "teacher"
              ? " 교사용 페이지에서 보드를 만들어 주세요."
              : " 선생님이 보드를 만들 때까지 기다려 주세요."}
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {boards.map((board) => (
              <li key={board.id}>
                <Link
                  href={`/board/${board.id}`}
                  className="touch-target flex flex-col justify-center rounded-2xl border border-border bg-surface px-5"
                >
                  <span className="text-base font-semibold">{board.title}</span>
                  <span className="text-xs text-muted">탭하여 입장</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
