"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { createReport } from "@/lib/actions";
import { Modal } from "@/components/Modal";
import { PrimaryButton } from "@/components/PrimaryButton";

const reasons = ["개인정보 노출", "욕설/비방", "허위 사건", "기타"];

export function ReportModal({ caseId, targetUserId }: { caseId: string; targetUserId?: string | null }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-8 items-center justify-center gap-1.5 rounded-full border border-[#E8E8ED] bg-white px-3 text-xs font-black text-neutral-700 shadow-sm"
      >
        <Flag aria-hidden="true" size={13} />
        신고
      </button>
      <Modal open={open} title="사건 신고" onClose={() => setOpen(false)}>
        <form action={createReport} className="space-y-4">
          <input type="hidden" name="caseId" value={caseId} />
          {targetUserId ? <input type="hidden" name="targetUserId" value={targetUserId} /> : null}
          <div className="grid grid-cols-2 gap-2">
            {reasons.map((reason) => (
              <label
                key={reason}
                className="flex min-h-12 cursor-pointer items-center justify-center rounded-[16px] border border-[#E8E8ED] px-3 text-sm font-black text-neutral-800 has-[:checked]:border-[#FF3D00] has-[:checked]:bg-[#FFF2EC] has-[:checked]:text-[#F04411]"
              >
                <input className="sr-only" type="radio" name="reason" value={reason} required />
                {reason}
              </label>
            ))}
          </div>
          <textarea
            name="detail"
            placeholder="상세 내용을 입력하세요"
            className="min-h-24 w-full resize-none rounded-[18px] border border-[#E8E8ED] px-4 py-3 text-base outline-none focus:border-[#FF3D00] focus:ring-4 focus:ring-[#FF3D00]/10"
          />
          <PrimaryButton type="submit" className="w-full">
            신고 접수
          </PrimaryButton>
        </form>
      </Modal>
    </>
  );
}
