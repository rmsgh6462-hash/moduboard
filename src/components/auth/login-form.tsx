"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import {
  loginAction,
  type ActionResult,
} from "@/app/actions/auth";

const initial: ActionResult = { ok: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">아이디</span>
        <input
          name="loginId"
          type="text"
          autoComplete="username"
          inputMode="text"
          required
          placeholder="예: student01 또는 teacher01"
          className="touch-target w-full rounded-xl border border-border bg-surface px-4 text-base outline-none ring-brand focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">비밀번호</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="비밀번호"
          className="touch-target w-full rounded-xl border border-border bg-surface px-4 text-base outline-none ring-brand focus:ring-2"
        />
      </label>

      {state.message && !state.ok ? (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="touch-target inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand text-base font-semibold text-white disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-5 animate-spin" aria-hidden />
        ) : (
          <LogIn className="size-5" aria-hidden />
        )}
        로그인
      </button>

      <p className="text-center text-sm text-muted">
        교사이신가요?{" "}
        <Link href="/signup" className="font-semibold text-brand">
          교사 회원가입
        </Link>
      </p>
    </form>
  );
}
