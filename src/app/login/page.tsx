import { redirect } from "next/navigation";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function LoginPage() {
  const profile = await getCurrentProfile();
  if (profile) {
    redirect(profile.role === "teacher" ? "/teacher" : "/boards");
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-10 pb-[calc(2.5rem+var(--safe-bottom))]">
      <div>
        <p className="text-sm font-medium text-brand">모두보드</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">로그인</h1>
        <p className="mt-2 text-sm text-muted">
          한 번 로그인하면 브라우저에 세션이 유지되어 자동으로 다시 들어옵니다.
        </p>
      </div>

      <LoginForm />

      <div className="rounded-2xl bg-brand-soft/60 px-4 py-3 text-xs leading-relaxed text-muted">
        <p className="font-semibold text-foreground">시드 테스트 계정</p>
        <p>교사: teacher01 / Teacher1234!</p>
        <p>학생: student01 / Student1234!</p>
      </div>

      <Link href="/" className="text-center text-sm font-medium text-brand">
        ← 홈으로
      </Link>
    </div>
  );
}
