"use server";

import { revalidatePath } from "next/cache";
import { requireTeacher } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/actions/auth";

export async function createGroupAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireTeacher();
  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const grade = Number(formData.get("grade"));
  const classNum = Number(formData.get("classNum"));

  if (!schoolName) {
    return { ok: false, message: "학교명을 입력해 주세요." };
  }
  if (!Number.isInteger(grade) || grade < 1 || grade > 12) {
    return { ok: false, message: "학년은 1~12 사이 숫자여야 합니다." };
  }
  if (!Number.isInteger(classNum) || classNum < 1) {
    return { ok: false, message: "반 번호를 올바르게 입력해 주세요." };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("groups")
    .select("id")
    .eq("teacher_id", profile.id)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      ok: false,
      message: "이미 학급 그룹이 있습니다. 학생 명단을 이어서 등록해 주세요.",
    };
  }

  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      teacher_id: profile.id,
      school_name: schoolName,
      grade,
      class_num: classNum,
    })
    .select("*")
    .single();

  if (error || !group) {
    if (error?.code === "23505") {
      return {
        ok: false,
        message: "같은 학교·학년·반 그룹이 이미 존재합니다.",
      };
    }
    return { ok: false, message: error?.message ?? "그룹 생성에 실패했습니다." };
  }

  const { error: linkError } = await supabase
    .from("users")
    .update({ group_id: group.id })
    .eq("id", profile.id);

  if (linkError) {
    return {
      ok: false,
      message: `그룹은 만들어졌지만 교사 연결에 실패했습니다: ${linkError.message}`,
    };
  }

  revalidatePath("/teacher");
  return { ok: true, message: "학급 그룹이 생성되었습니다." };
}

export async function createBoardAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireTeacher();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!title) {
    return { ok: false, message: "보드 제목을 입력해 주세요." };
  }

  const groupId = profile.group_id ?? profile.group?.id;
  if (!groupId) {
    return { ok: false, message: "먼저 학급 그룹을 만들어 주세요." };
  }

  const supabase = await createClient();
  const { data: board, error } = await supabase
    .from("boards")
    .insert({
      title,
      group_id: groupId,
      created_by: profile.id,
      description,
      layout: formData.get("layout") === "column" ? "column" : formData.get("layout") === "mindmap" ? "mindmap" : "brick",
      sort_order: formData.get("sortOrder") === "oldest" ? "oldest" : "newest",
      is_locked: formData.get("isLocked") === "on",
      is_hidden: formData.get("isHidden") === "on",
      audience_ids: formData.getAll("audienceIds").map(String),
      allow_video: formData.get("allowVideo") === "on",
      allow_pdf: formData.get("allowPdf") === "on",
      allow_hwp: formData.get("allowHwp") === "on",
      allow_image: formData.get("allowImage") === "on",
      allow_comments: formData.get("allowComments") === "on",
      allow_likes: formData.get("allowLikes") === "on",
      background: String(formData.get("background") ?? "mint"),
    })
    .select("id")
    .single();

  if (error || !board) {
    return { ok: false, message: error?.message ?? "보드 생성에 실패했습니다." };
  }

  revalidatePath("/teacher");
  revalidatePath("/boards");
  return { ok: true, message: "보드가 만들어졌습니다." };
}
