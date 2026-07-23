"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toAuthEmail } from "@/lib/auth/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  ok: boolean;
  message?: string;
};

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const loginId = String(formData.get("loginId") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!loginId || !password) {
    return { ok: false, message: "아이디와 비밀번호를 입력해 주세요." };
  }

  const supabase = await createClient();
  const email = toAuthEmail(loginId);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid path") || msg.includes("failed to fetch")) {
      return {
        ok: false,
        message:
          "Supabase 연결에 실패했습니다. .env.local의 NEXT_PUBLIC_SUPABASE_URL이 https://xxxx.supabase.co 형태인지 확인해 주세요. (/rest/v1 제외)",
      };
    }
    return {
      ok: false,
      message: "아이디 또는 비밀번호가 올바르지 않습니다.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "로그인에 실패했습니다." };
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  revalidatePath("/", "layout");
  redirect(profile?.role === "teacher" ? "/teacher" : "/boards");
}

export async function signupTeacherAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const loginId = String(formData.get("loginId") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !loginId || !password) {
    return { ok: false, message: "이름, 아이디, 비밀번호를 모두 입력해 주세요." };
  }

  if (!/^[a-z0-9._-]{3,32}$/.test(loginId)) {
    return {
      ok: false,
      message: "아이디는 영문 소문자·숫자·._- 3~32자로 입력해 주세요.",
    };
  }

  if (password.length < 6) {
    return { ok: false, message: "비밀번호는 6자 이상이어야 합니다." };
  }

  const supabase = await createClient();
  const email = toAuthEmail(loginId);

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: "teacher" },
    },
  });

  if (signUpError) {
    return {
      ok: false,
      message: signUpError.message.includes("already")
        ? "이미 사용 중인 아이디입니다."
        : signUpError.message,
    };
  }

  const userId = signUpData.user?.id;
  if (!userId) {
    return {
      ok: false,
      message:
        "가입 확인 메일이 필요할 수 있습니다. Supabase Auth에서 Email Confirm을 끄거나 메일을 확인해 주세요.",
    };
  }

  // 이메일 확인이 켜져 세션이 없어도 프로필을 만들 수 있도록 Admin 사용
  let admin;
  try {
    admin = createAdminClient();
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Service Role Key가 없어 프로필을 만들 수 없습니다.",
    };
  }

  const { error: profileError } = await admin.from("users").insert({
    id: userId,
    role: "teacher",
    name,
    login_id: loginId,
    group_id: null,
    student_num: null,
    gender: null,
  });

  if (profileError) {
    return {
      ok: false,
      message: `프로필 생성 실패: ${profileError.message}`,
    };
  }

  // 세션이 없으면(이메일 확인 필요) 로그인 유도
  if (!signUpData.session) {
    return {
      ok: true,
      message:
        "가입되었습니다. Supabase Auth → Providers → Email에서 Confirm email을 끈 뒤 로그인해 주세요.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/teacher");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
