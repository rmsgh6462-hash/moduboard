"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LayoutGrid, Loader2, Plus } from "lucide-react";
import { createBoardAction } from "@/app/actions/groups";
import type { ActionResult } from "@/app/actions/auth";
import type { Board } from "@/types/database";

const initial: ActionResult = { ok: false };

type Props = {
  boards: Board[];
};

export function BoardCreatePanel({ boards }: Props) {
  const [state, formAction, pending] = useActionState(
    createBoardAction,
    initial,
  );

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <LayoutGrid className="size-5 text-brand" aria-hidden />
        <h2 className="text-lg font-semibold">수업 보드</h2>
      </div>

      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <input
          name="title"
          required
          placeholder="보드 제목 (예: 오늘 느낀 점)"
          className="touch-target flex-1 rounded-xl border border-border px-4 text-base outline-none ring-brand focus:ring-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl bg-brand px-4 font-semibold text-white disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-5" aria-hidden />
          )}
          만들기
        </button>
      </form>

      {state.message ? (
        <p
          className={`rounded-xl px-3 py-2 text-sm ${
            state.ok ? "bg-brand-soft text-brand" : "bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      {boards.length === 0 ? (
        <p className="text-sm text-muted">아직 보드가 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                href={`/board/${board.id}`}
                className="touch-target flex items-center justify-between rounded-xl bg-background px-4 text-sm font-semibold"
              >
                <span className="truncate">{board.title}</span>
                <span className="text-brand">열기</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
