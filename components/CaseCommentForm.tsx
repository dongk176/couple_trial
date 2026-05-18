"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createCaseCommentInline } from "@/lib/actions";
import { CASE_COMMENT_MAX_LENGTH } from "@/lib/constants";

type CommentFormVariant = "comment" | "reply";

const initialState = {
  ok: false,
  message: "",
  submittedAt: 0
};

function SubmitButton({ label, variant }: { label: string; variant: CommentFormVariant }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={
        variant === "comment"
          ? "inline-flex min-h-11 items-center justify-center rounded-full bg-[#FF3D00] px-5 text-sm font-black text-white shadow-[0_8px_18px_rgba(255,61,0,0.2)] disabled:opacity-60"
          : "inline-flex min-h-9 items-center justify-center rounded-full bg-neutral-950 px-4 text-xs font-black text-white disabled:opacity-60"
      }
      disabled={pending}
    >
      {pending ? "등록 중" : label}
    </button>
  );
}

export function CaseCommentForm({
  caseId,
  parentId,
  textareaId,
  label,
  placeholder,
  submitLabel,
  variant = "comment"
}: {
  caseId: string;
  parentId?: string;
  textareaId: string;
  label: string;
  placeholder: string;
  submitLabel: string;
  variant?: CommentFormVariant;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const [state, formAction] = useActionState(createCaseCommentInline, initialState);

  useEffect(() => {
    if (!state.submittedAt) return;

    const toast = toastRef.current;
    if (toast) {
      toast.hidden = false;
    }

    if (state.ok) {
      formRef.current?.reset();
    }

    const timer = window.setTimeout(() => {
      if (toast) {
        toast.hidden = true;
      }
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [state]);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className={variant === "comment" ? "mt-5" : "mt-3 rounded-[18px] border border-[#E8E8ED] bg-white p-3"}
      >
        <input type="hidden" name="caseId" value={caseId} />
        {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
        <label
          className={variant === "comment" ? "block text-sm font-black text-neutral-950" : "block text-xs font-black text-neutral-500"}
          htmlFor={textareaId}
        >
          {label}
        </label>
        <textarea
          className={
            variant === "comment"
              ? "mt-2 min-h-[88px] w-full resize-none rounded-[16px] border border-[#E8E8ED] bg-neutral-50 px-4 py-3 text-base font-bold leading-6 text-neutral-950 outline-none placeholder:text-neutral-400 focus:border-[#FF3D00] focus:bg-white"
              : "mt-2 min-h-[58px] w-full resize-none rounded-[16px] bg-neutral-50 px-3 py-2 text-sm font-bold leading-6 text-neutral-950 outline-none placeholder:text-neutral-400 focus:bg-white focus:ring-2 focus:ring-[#FF3D00]/15"
          }
          id={textareaId}
          maxLength={CASE_COMMENT_MAX_LENGTH}
          name="body"
          placeholder={placeholder}
          required
          rows={variant === "comment" ? 3 : 2}
        />
        <div className={variant === "comment" ? "mt-3 flex items-center justify-between gap-3" : "mt-2 flex items-center justify-between gap-3"}>
          <p className="text-xs font-bold text-neutral-400">최대 {CASE_COMMENT_MAX_LENGTH}자</p>
          <SubmitButton label={submitLabel} variant={variant} />
        </div>
      </form>

      <div
        ref={toastRef}
        className={[
          "fixed bottom-[calc(96px_+_env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%_-_40px)] max-w-[360px] -translate-x-1/2 rounded-full px-5 py-3 text-center text-sm font-black shadow-[0_14px_34px_rgba(0,0,0,0.18)]",
          state.ok ? "bg-neutral-950 text-white" : "bg-[#FFF2EC] text-[#F04411]"
        ].join(" ")}
        hidden
        role="status"
      >
        {state.message}
      </div>
    </>
  );
}
