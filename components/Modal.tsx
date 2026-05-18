"use client";

import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 px-4 py-[calc(24px_+_env(safe-area-inset-bottom))]">
      <div className="max-h-[calc(100dvh_-_48px_-_env(safe-area-inset-bottom))] w-full max-w-[398px] overflow-y-auto rounded-[18px] bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-neutral-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-full px-3 text-sm font-bold text-neutral-500"
          >
            닫기
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
