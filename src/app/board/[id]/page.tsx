import { notFound, redirect } from "next/navigation";
import { BoardCanvas } from "@/components/board/board-canvas";
import { BoardToolbar } from "@/components/board/board-toolbar";
import { ColumnBoard } from "@/components/board/column-board";
import { requireProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BoardPage({ params }: PageProps) {
  const { id: boardId } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .maybeSingle();

  if (!board) notFound();

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", board.group_id)
    .maybeSingle();

  if (!group) notFound();

  const memberGroupId = profile.group_id ?? profile.group?.id;
  const canAccess =
    memberGroupId === board.group_id || group.teacher_id === profile.id;

  if (!canAccess) {
    redirect("/boards");
  }

  const [{ data: posts }, { data: columns }] = await Promise.all([
    supabase.from("posts").select("*").eq("board_id", boardId).order("created_at", { ascending: board.sort_order === "oldest" }),
    supabase.from("board_columns").select("*").eq("board_id", boardId).order("position", { ascending: true }),
  ]);

  const subtitle = `${group.school_name} ${group.grade}학년 ${group.class_num}반 · ${profile.name}`;
  // DB의 기존 brick 값을 UI 표준 layoutType인 grid로 정규화합니다.
  const layoutType: "column" | "grid" = board.layout === "column" ? "column" : "grid";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <BoardToolbar title={board.title} subtitle={subtitle} />
      {layoutType === "column" ? (
        <ColumnBoard board={board} group={group} profile={profile} columns={columns ?? []} initialPosts={posts ?? []} />
      ) : (
        <BoardCanvas boardId={board.id} boardTitle={board.title} group={group} profile={profile} initialPosts={posts ?? []} />
      )}
    </div>
  );
}
