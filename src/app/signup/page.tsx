import { redirect } from "next/navigation";
import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function SignupPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(profile.role === "teacher" ? "/teacher" : "/boards");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10 pb-[calc(2.5rem+var(--safe-bottom))]">
      <div>
        <p className="text-sm font-medium text-brand">모두보드</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">교사 회원가입</h1>
        <p className="mt-2 text-sm text-muted">
          가입 후 학급 그룹을 만들고 학생 계정을 일괄 등록할 수 있습니다.
        </p>
      </div>

      <SignupForm />

      <Link href="/" className="text-center text-sm font-medium text-brand">
        ← 홈으로
      </Link>
    </div>
  );
}
