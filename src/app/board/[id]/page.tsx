import { notFound, redirect } from "next/navigation";
import { BoardCanvas } from "@/components/board/board-canvas";
import { BoardToolbar } from "@/components/board/board-toolbar";
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

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("board_id", boardId)
    .order("created_at", { ascending: true });

  const subtitle = `${group.school_name} ${group.grade}학년 ${group.class_num}반 · ${profile.name}`;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <BoardToolbar title={board.title} subtitle={subtitle} />
      <BoardCanvas
        boardId={board.id}
        boardTitle={board.title}
        group={group}
        profile={profile}
        initialPosts={posts ?? []}
      />
    </div>
  );
}
