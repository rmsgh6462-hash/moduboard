"use client";

import { useActionState } from "react";
import { Loader2, School } from "lucide-react";
import { createGroupAction } from "@/app/actions/groups";
import type { ActionResult } from "@/app/actions/auth";

const initial: ActionResult = { ok: false };

export function CreateGroupForm() {
  const [state, formAction, pending] = useActionState(
    createGroupAction,
    initial,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5"
    >
      <div className="flex items-center gap-2">
        <School className="size-5 text-brand" aria-hidden />
        <h2 className="text-lg font-semibold">학급 그룹 만들기</h2>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">학교명</span>
        <input
          name="schoolName"
          required
          placeholder="모두초등학교"
          className="touch-target w-full rounded-xl border border-border px-4 text-base outline-none ring-brand focus:ring-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">학년</span>
          <input
            name="grade"
            type="number"
            inputMode="numeric"
            min={1}
            max={12}
            required
            placeholder="5"
            className="touch-target w-full rounded-xl border border-border px-4 text-base outline-none ring-brand focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">반</span>
          <input
            name="classNum"
            type="number"
            inputMode="numeric"
            min={1}
            required
            placeholder="2"
            className="touch-target w-full rounded-xl border border-border px-4 text-base outline-none ring-brand focus:ring-2"
          />
        </label>
      </div>

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
        {pending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : null}
        그룹 생성
      </button>
    </form>
  );
}
