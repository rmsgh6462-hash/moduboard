"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/app/actions/auth";
import { buildStudentLoginId, toAuthEmail } from "@/lib/auth/email";
import { requireTeacher } from "@/lib/auth/session";
import { parseStudentRoster } from "@/lib/students/parse-roster";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function bulkCreateStudentsAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireTeacher();
  const groupId = profile.group_id ?? profile.group?.id;

  if (!groupId) {
    return { ok: false, message: "먼저 학급 그룹을 생성해 주세요." };
  }

  const classCode = String(formData.get("classCode") ?? "").trim();
  const defaultPassword = String(formData.get("defaultPassword") ?? "").trim();
  const roster = String(formData.get("roster") ?? "");

  if (!/^[a-zA-Z0-9]{2,12}$/.test(classCode)) {
    return {
      ok: false,
      message: "학급 코드는 영문/숫자 2~12자로 입력해 주세요. (예: modo52)",
    };
  }

  if (defaultPassword.length < 4) {
    return { ok: false, message: "기본 비밀번호는 4자 이상으로 설정해 주세요." };
  }

  const parsed = parseStudentRoster(roster);
  if (parsed.error) {
    return { ok: false, message: parsed.error };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Admin 클라이언트 오류",
    };
  }

  const created: string[] = [];
  const failed: string[] = [];

  for (const student of parsed.students) {
    const loginId = buildStudentLoginId(classCode, student.studentNum);
    const email = toAuthEmail(loginId);

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          name: student.name,
          role: "student",
          login_id: loginId,
        },
      });

    if (authError || !authData.user) {
      failed.push(
        `${student.studentNum}번 ${student.name}: ${authError?.message ?? "계정 생성 실패"}`,
      );
      continue;
    }

    const { error: profileError } = await admin.from("users").insert({
      id: authData.user.id,
      role: "student",
      group_id: groupId,
      student_num: student.studentNum,
      name: student.name,
      gender: student.gender,
      login_id: loginId,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      failed.push(
        `${student.studentNum}번 ${student.name}: ${profileError.message}`,
      );
      continue;
    }

    created.push(loginId);
  }

  revalidatePath("/teacher");

  if (created.length === 0) {
    return {
      ok: false,
      message: failed[0] ?? "학생을 생성하지 못했습니다.",
    };
  }

  const summary = `${created.length}명 생성 완료 (아이디: ${created.slice(0, 3).join(", ")}${created.length > 3 ? "…" : ""})`;
  if (failed.length > 0) {
    return {
      ok: true,
      message: `${summary} / 실패 ${failed.length}명 — ${failed[0]}`,
    };
  }

  return { ok: true, message: summary };
}


export async function createStudentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const profile = await requireTeacher(); const groupId = profile.group_id ?? profile.group?.id;
  if (!groupId) return { ok:false, message:"먼저 학급을 만들어 주세요." };
  const loginId=String(formData.get("loginId")??"").trim().toLowerCase(), password=String(formData.get("password")??""), name=String(formData.get("name")??"").trim(), studentNum=Number(formData.get("studentNum"));
  if(!/^[a-z0-9._-]{3,24}$/.test(loginId)) return {ok:false,message:"아이디는 영문 소문자·숫자 3~24자로 입력해 주세요."};
  if(password.length<4) return {ok:false,message:"비밀번호는 4자 이상이어야 합니다."};
  if(!name||!Number.isInteger(studentNum)||studentNum<1) return {ok:false,message:"번호와 이름을 확인해 주세요."};
  let admin; try{admin=createAdminClient()}catch(error){return {ok:false,message:error instanceof Error?error.message:"관리자 연결 오류"}}
  const {data,error}=await admin.auth.admin.createUser({email:toAuthEmail(loginId),password,email_confirm:true,user_metadata:{name,role:"student",login_id:loginId}});
  if(error||!data.user)return {ok:false,message:error?.message??"계정 생성 실패"};
  const {error:profileError}=await admin.from("users").insert({id:data.user.id,role:"student",group_id:groupId,student_num:studentNum,name,gender:"other",login_id:loginId});
  if(profileError){await admin.auth.admin.deleteUser(data.user.id);return {ok:false,message:profileError.message}}
  revalidatePath("/teacher"); return {ok:true,message:name+" 학생 계정을 만들었습니다."};
}

export async function deleteStudentAction(
  studentId: string,
): Promise<ActionResult> {
  const profile = await requireTeacher();
  const groupId = profile.group_id ?? profile.group?.id;
  if (!groupId) {
    return { ok: false, message: "학급 그룹이 없습니다." };
  }

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("users")
    .select("id, role, group_id")
    .eq("id", studentId)
    .maybeSingle();

  if (!student || student.role !== "student" || student.group_id !== groupId) {
    return { ok: false, message: "삭제할 학생을 찾을 수 없습니다." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Admin 클라이언트 오류",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(studentId);
  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/teacher");
  return { ok: true, message: "학생 계정을 삭제했습니다." };
}
