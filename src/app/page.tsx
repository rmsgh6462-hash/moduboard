import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, LogIn, Smartphone, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import { logoutAction } from "@/app/actions/auth";

export default async function Home() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-surface/90 px-4 py-3 pt-[calc(0.75rem+var(--safe-top))] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <p className="text-lg font-bold tracking-tight text-brand">모두보드</p>
          {profile ? (
            <div className="flex items-center gap-2">
              <Link
                href={profile.role === "teacher" ? "/teacher" : "/boards"}
                className="touch-target inline-flex items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-white"
              >
                {profile.role === "teacher" ? "학급 관리" : "내 보드"}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="touch-target rounded-xl border border-border px-3 text-sm font-medium"
                >
                  로그아웃
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="touch-target inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white"
            >
              <LogIn className="size-4" aria-hidden />
              로그인
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 pb-[calc(2rem+var(--safe-bottom))]">
        <section className="rounded-3xl bg-brand px-6 py-10 text-white shadow-sm">
          <p className="mb-2 text-sm font-medium text-teal-100">학급 패들렛</p>
          <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            스마트폰으로도
            <br />
            바로 붙이는 의견 보드
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-teal-50">
            {profile
              ? `${profile.name} 님, 환영합니다. 이어서 보드로 이동해 보세요.`
              : "교사와 학생 60명 규모 수업에서 터치 드래그·사진 첨부·실시간 동기화를 지원합니다."}
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <FeatureCard
            icon={<Users className="size-5" aria-hidden />}
            title="학급 그룹"
            description="학교·학년·반으로 그룹을 만들고 학생 명단을 일괄 등록합니다."
          />
          <FeatureCard
            icon={<Smartphone className="size-5" aria-hidden />}
            title="모바일 터치"
            description="손가락으로 포스트잇을 옮기고, 카메라·갤러리로 사진을 첨부합니다."
          />
          <FeatureCard
            icon={<BookOpen className="size-5" aria-hidden />}
            title="자동 로그인"
            description="최초 1회 로그인 후 세션이 유지되어 수업 중 바로 입장합니다."
          />
        </section>

        <section className="flex flex-col gap-3 sm:flex-row">
          {profile ? (
            <>
              <Link
                href="/boards"
                className="touch-target inline-flex flex-1 items-center justify-center rounded-2xl bg-brand px-5 text-base font-semibold text-white"
              >
                보드 입장
              </Link>
              {profile.role === "teacher" ? (
                <Link
                  href="/teacher"
                  className="touch-target inline-flex flex-1 items-center justify-center rounded-2xl border border-border bg-surface px-5 text-base font-semibold text-foreground"
                >
                  교사용 그룹 관리
                </Link>
              ) : null}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="touch-target inline-flex flex-1 items-center justify-center rounded-2xl bg-brand px-5 text-base font-semibold text-white"
              >
                학생·교사 로그인
              </Link>
              <Link
                href="/signup"
                className="touch-target inline-flex flex-1 items-center justify-center rounded-2xl border border-border bg-surface px-5 text-base font-semibold text-foreground"
              >
                교사 회원가입
              </Link>
            </>
          )}
        </section>

        <p className="text-center text-sm text-muted">
          5단계 완료 · Realtime · 모바일 최적화 · Vercel 배포 준비됨
        </p>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 inline-flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}
