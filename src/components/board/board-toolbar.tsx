import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

type Props = {
  title: string;
  subtitle: string;
  backHref?: string;
};

export function BoardToolbar({
  title,
  subtitle,
  backHref = "/boards",
}: Props) {
  return (
    <header className="board-toolbar z-20 shrink-0 border-b border-border bg-surface/95 backdrop-blur-md">
      <div className="flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
        <Link
          href={backHref}
          className="touch-target inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background sm:size-10"
          aria-label="뒤로"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold tracking-tight sm:text-base">
            {title}
          </h1>
          <p className="truncate text-[11px] text-muted sm:text-xs">
            {subtitle}
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="touch-target rounded-xl px-2.5 text-xs font-medium text-muted sm:px-3"
          >
            로그아웃
          </button>
        </form>
      </div>
    </header>
  );
}
