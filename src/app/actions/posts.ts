"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/app/actions/auth";
import {
  canDeletePost,
  canEditPost,
  canMovePost,
} from "@/lib/board/permissions";
import { requireProfile } from "@/lib/auth/session";
import { DEFAULT_POST_COLOR } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/database";

async function getBoardContext(boardId: string) {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: board, error } = await supabase
    .from("boards")
    .select("*")
    .eq("id", boardId)
    .maybeSingle();

  if (error || !board) {
    return { profile, board: null, group: null, error: "보드를 찾을 수 없습니다." };
  }

  const { data: group } = await supabase
    .from("groups")
    .select("*")
    .eq("id", board.group_id)
    .maybeSingle();

  const memberGroupId = profile.group_id ?? profile.group?.id;
  const isMember =
    memberGroupId === board.group_id ||
    (group != null && group.teacher_id === profile.id);

  if (!isMember) {
    return {
      profile,
      board: null,
      group: null,
      error: "이 보드에 접근할 권한이 없습니다.",
    };
  }

  return { profile, board, group, error: null };
}

export async function createPostAction(input: {
  boardId: string;
  content: string;
  title?: string;
  columnId?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  mediaType?: "image" | "video" | "mindmap" | null;
  mediaPosition?: "top" | "bottom";
  color?: string;
  imageUrl?: string | null;
  xPos?: number;
  yPos?: number;
}): Promise<ActionResult & { post?: Post }> {
  const ctx = await getBoardContext(input.boardId);
  if (ctx.error || !ctx.board) {
    return { ok: false, message: ctx.error };
  }

  const content = input.content.trim();
  if (!input.title?.trim() && !content && !input.imageUrl && !input.attachmentUrl) {
    return { ok: false, message: "내용 또는 사진을 추가해 주세요." };
  }

  const supabase = await createClient();
  const xPos = input.xPos ?? 40 + Math.floor(Math.random() * 80);
  const yPos = input.yPos ?? 80 + Math.floor(Math.random() * 120);

  const { data: post, error } = await supabase
    .from("posts")
    .insert({
      board_id: input.boardId,
      user_id: ctx.profile.id,
      author_name: ctx.profile.name,
      content,
      title: input.title?.trim() ?? "",
      column_id: input.columnId ?? null,
      attachment_url: input.attachmentUrl ?? null,
      attachment_name: input.attachmentName ?? null,
      attachment_type: input.attachmentType ?? null,
      media_type: input.mediaType ?? (input.imageUrl ? "image" : null),
      media_position: input.mediaPosition ?? "bottom",
      image_url: input.imageUrl ?? null,
      color: input.color ?? DEFAULT_POST_COLOR,
      x_pos: Math.max(0, Math.round(xPos)),
      y_pos: Math.max(0, Math.round(yPos)),
    })
    .select("*")
    .single();

  if (error || !post) {
    return { ok: false, message: error?.message ?? "포스트 작성에 실패했습니다." };
  }

  revalidatePath(`/board/${input.boardId}`);
  return { ok: true, post };
}

export async function updatePostAction(input: {
  postId: string;
  boardId: string;
  content: string;
  title?: string;
  color: string;
  imageUrl?: string | null;
  mediaType?: "image" | "video" | "mindmap" | null;
  mediaPosition?: "top" | "bottom";
}): Promise<ActionResult & { post?: Post }> {
  const ctx = await getBoardContext(input.boardId);
  if (ctx.error || !ctx.board) {
    return { ok: false, message: ctx.error };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("*")
    .eq("id", input.postId)
    .maybeSingle();

  if (!existing || existing.board_id !== input.boardId) {
    return { ok: false, message: "포스트를 찾을 수 없습니다." };
  }

  if (!canEditPost(ctx.profile, existing)) {
    return { ok: false, message: "본인이 작성한 글만 수정할 수 있습니다." };
  }

  const content = input.content.trim();
  if (!input.title?.trim() && !content && !input.imageUrl) {
    return { ok: false, message: "내용 또는 사진을 추가해 주세요." };
  }

  const { data: post, error } = await supabase
    .from("posts")
    .update({
      content,
      title: input.title?.trim() ?? existing.title ?? "",
      color: input.color,
      image_url: input.imageUrl ?? null,
      media_type: input.mediaType ?? null,
      media_position: input.mediaPosition ?? "bottom",
    })
    .eq("id", input.postId)
    .select("*")
    .single();

  if (error || !post) {
    return { ok: false, message: error?.message ?? "수정에 실패했습니다." };
  }

  revalidatePath(`/board/${input.boardId}`);
  return { ok: true, post };
}

export async function deletePostAction(input: {
  postId: string;
  boardId: string;
}): Promise<ActionResult> {
  const ctx = await getBoardContext(input.boardId);
  if (ctx.error || !ctx.board) {
    return { ok: false, message: ctx.error };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("*")
    .eq("id", input.postId)
    .maybeSingle();

  if (!existing || existing.board_id !== input.boardId) {
    return { ok: false, message: "포스트를 찾을 수 없습니다." };
  }

  if (!canDeletePost(ctx.profile, existing, ctx.group)) {
    return { ok: false, message: "삭제 권한이 없습니다." };
  }

  const { error } = await supabase.from("posts").delete().eq("id", input.postId);
  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath(`/board/${input.boardId}`);
  return { ok: true, message: "삭제되었습니다." };
}

export async function updatePostPositionAction(input: {
  postId: string;
  boardId: string;
  xPos: number;
  yPos: number;
}): Promise<ActionResult> {
  const ctx = await getBoardContext(input.boardId);
  if (ctx.error || !ctx.board) {
    return { ok: false, message: ctx.error };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("posts")
    .select("*")
    .eq("id", input.postId)
    .maybeSingle();

  if (!existing || existing.board_id !== input.boardId) {
    return { ok: false, message: "포스트를 찾을 수 없습니다." };
  }

  if (!canMovePost(ctx.profile, existing, ctx.group)) {
    return { ok: false, message: "이동 권한이 없습니다." };
  }

  const x = Math.max(0, Math.round(input.xPos));
  const y = Math.max(0, Math.round(input.yPos));

  const { error } = await supabase
    .from("posts")
    .update({ x_pos: x, y_pos: y })
    .eq("id", input.postId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
