import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { BoardCreatePanel } from "@/components/teacher/board-create-panel";
import { CreateGroupForm } from "@/components/teacher/create-group-form";
import { StudentRosterPanel } from "@/components/teacher/student-roster-panel";
import { requireTeacher } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Board, UserProfile } from "@/types/database";

export default async function TeacherPage() {
  const profile = await requireTeacher();
  const supabase = await createClient();
  const groupId = profile.group_id ?? profile.group?.id ?? null;

  let students: UserProfile[] = [];
  let boards: Board[] = [];

  if (groupId) {
    const [{ data: studentRows }, { data: boardRows }] = await Promise.all([
      supabase
        .from("users")
        .select("*")
        .eq("group_id", groupId)
        .eq("role", "student")
        .order("student_num", { ascending: true }),
      supabase
        .from("boards")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false }),
    ]);
    students = studentRows ?? [];
    boards = boardRows ?? [];
  }

  const group = profile.group;
  const suggestedCode =
    group != null ? `g${group.grade}c${group.class_num}` : "modo52";

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader name={profile.name} roleLabel="교사" />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 pb-[calc(2rem+var(--safe-bottom))]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">학급 관리</h1>
          <p className="mt-1 text-sm text-muted">
            학교·학년·반 그룹을 만들고 학생 계정을 일괄 등록하세요.
          </p>
        </div>

        {group ? (
          <div className="rounded-2xl bg-brand px-5 py-4 text-white">
            <p className="text-sm text-teal-100">현재 학급</p>
            <p className="text-xl font-bold">
              {group.school_name} {group.grade}학년 {group.class_num}반
            </p>
            <Link
              href="/boards"
              className="mt-3 inline-flex text-sm font-semibold text-teal-50 underline-offset-2 hover:underline"
            >
              보드 목록 보기 →
            </Link>
          </div>
        ) : (
          <CreateGroupForm />
        )}

        {groupId ? (
          <>
            <StudentRosterPanel
              students={students}
              suggestedCode={suggestedCode}
            />
            <BoardCreatePanel boards={boards} />
          </>
        ) : null}
      </main>
    </div>
  );
}
