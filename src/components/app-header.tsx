import { logoutAction } from "@/app/actions/auth";

type Props = {
  name: string;
  roleLabel: string;
};

export function AppHeader({ name, roleLabel }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/90 px-4 py-3 pt-[calc(0.75rem+var(--safe-top))] backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold tracking-tight text-brand">모두보드</p>
          <p className="truncate text-xs text-muted">
            {roleLabel} · {name}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="touch-target rounded-xl border border-border px-3 text-sm font-medium"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
