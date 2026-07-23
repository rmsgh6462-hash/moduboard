"use client";

import { useActionState, useTransition } from "react";
import { Loader2, Trash2, Users } from "lucide-react";
import {
  bulkCreateStudentsAction,
  createStudentAction,
  deleteStudentAction,
} from "@/app/actions/students";
import type { ActionResult } from "@/app/actions/auth";
import type { UserProfile } from "@/types/database";

const initial: ActionResult = { ok: false };

type Props = {
  students: UserProfile[];
  suggestedCode: string;
};

export function StudentRosterPanel({ students, suggestedCode }: Props) {
  const [state, formAction, pending] = useActionState(
    bulkCreateStudentsAction,
    initial,
  );
  const [isPending, startTransition] = useTransition();
  const [singleState, singleAction, singlePending] = useActionState(createStudentAction, initial);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-brand" aria-hidden />
        <h2 className="text-lg font-semibold">학생 명단 일괄 등록</h2>
      </div>

      <form action={singleAction} className="grid gap-3 rounded-2xl bg-background p-4 sm:grid-cols-2">
        <h3 className="font-semibold sm:col-span-2">??? ???????? ?? ??</h3>
        <input name="studentNum" type="number" min="1" required placeholder="??" className="touch-target rounded-xl border border-border px-4" />
        <input name="name" required placeholder="?? ??" className="touch-target rounded-xl border border-border px-4" />
        <input name="loginId" required placeholder="??? ???" className="touch-target rounded-xl border border-border px-4" />
        <input name="password" required placeholder="??? ????" className="touch-target rounded-xl border border-border px-4" />
        <button disabled={singlePending} className="touch-target rounded-xl bg-brand font-semibold text-white sm:col-span-2">{singlePending?"?? ??":"?? ?? ???"}</button>
        {singleState.message?<p className={singleState.ok?"text-sm text-brand sm:col-span-2":"text-sm text-red-600 sm:col-span-2"}>{singleState.message}</p>:null}
      </form>
      <details className="rounded-2xl border border-border p-4"><summary className="cursor-pointer font-semibold">?? ?? ?? ??</summary>
      <form action={formAction} className="mt-4 flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">학급 코드</span>
            <input
              name="classCode"
              required
              defaultValue={suggestedCode}
              placeholder="modo52"
              className="touch-target w-full rounded-xl border border-border px-4 text-base outline-none ring-brand focus:ring-2"
            />
            <span className="text-xs text-muted">
              아이디 예: {suggestedCode}01, {suggestedCode}02 …
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">기본 비밀번호</span>
            <input
              name="defaultPassword"
              type="text"
              required
              defaultValue="1234"
              className="touch-target w-full rounded-xl border border-border px-4 text-base outline-none ring-brand focus:ring-2"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">명단 (한 줄에 한 명)</span>
          <textarea
            name="roster"
            required
            rows={8}
            placeholder={"1,이민,M\n2,박서연,F\n3,최준호,M"}
            className="min-h-40 w-full rounded-xl border border-border px-4 py-3 text-base outline-none ring-brand focus:ring-2"
          />
          <span className="text-xs text-muted">
            형식: 번호,이름,성별(M/F 선택)
          </span>
        </label>

        {state.message ? (
          <p
            className={`rounded-xl px-3 py-2 text-sm ${
              state.ok ? "bg-brand-soft text-brand" : "bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="touch-target inline-flex items-center justify-center gap-2 rounded-2xl bg-brand font-semibold text-white disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : null}
          학생 계정 일괄 생성
        </button>
      </form></details>

      <div className="border-t border-border pt-4">
        <h3 className="mb-3 text-sm font-semibold text-muted">
          등록된 학생 {students.length}명
        </h3>
        {students.length === 0 ? (
          <p className="text-sm text-muted">아직 등록된 학생이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {student.student_num}번 {student.name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    아이디: {student.login_id}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  className="touch-target inline-flex items-center justify-center rounded-xl text-red-600"
                  aria-label={`${student.name} 삭제`}
                  onClick={() => {
                    if (!confirm(`${student.name} 학생 계정을 삭제할까요?`)) {
                      return;
                    }
                    startTransition(async () => {
                      await deleteStudentAction(student.id);
                    });
                  }}
                >
                  <Trash2 className="size-5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
