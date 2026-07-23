"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";
import {
  signupTeacherAction,
  type ActionResult,
} from "@/app/actions/auth";

const initial: ActionResult = { ok: false };

export function SignupForm() {
  const [state, formAction, pending] = useActionState(
    signupTeacherAction,
    initial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">이름</span>
        <input
          name="name"
          type="text"
          required
          placeholder="김선생"
          className="touch-target w-full rounded-xl border border-border bg-surface px-4 text-base outline-none ring-brand focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">로그인 아이디</span>
        <input
          name="loginId"
          type="text"
          autoComplete="username"
          required
          placeholder="영문/숫자 (예: teacher02)"
          className="touch-target w-full rounded-xl border border-border bg-surface px-4 text-base outline-none ring-brand focus:ring-2"
        />
        <span className="text-xs text-muted">
          실제 로그인은 아이디만 입력하면 됩니다.
        </span>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">비밀번호</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="6자 이상"
          className="touch-target w-full rounded-xl border border-border bg-surface px-4 text-base outline-none ring-brand focus:ring-2"
        />
      </label>

      {state.message ? (
        <p
          className={`rounded-xl px-3 py-2 text-sm ${
            state.ok
              ? "bg-brand-soft text-brand"
              : "bg-red-50 text-red-700"
          }`}
          role="status"
        >
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
          <UserPlus className="size-5" aria-hidden />
        )}
        교사 계정 만들기
      </button>

      <p className="text-center text-sm text-muted">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-brand">
          로그인
        </Link>
      </p>
    </form>
  );
}
