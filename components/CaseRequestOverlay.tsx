"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function CaseRequestOverlay({ title }: { title: string }) {
  const router = useRouter();

  return (
    <div className="fixed inset-x-0 top-0 z-[60] mx-auto flex min-h-screen w-full max-w-[430px] items-center justify-center bg-black/30 px-5 backdrop-blur-sm">
      <section className="w-full rounded-[18px] border border-[#E8E8ED] bg-white p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-[16px] bg-[#FFF2EC] text-[#FF3D00]">
          <CheckCircle2 aria-hidden="true" size={30} strokeWidth={2.6} />
        </span>
        <h2 className="mt-5 text-2xl font-black text-neutral-950">사건 등록 완료!</h2>
        <p className="mt-2 text-lg font-black text-[#FF3D00]">{title}</p>
        <p className="mt-3 text-sm font-bold leading-6 text-neutral-500">
          피고의 답변이 제출되면 사건이 공개됩니다.
        </p>
        <button
          className="mt-5 min-h-12 w-full rounded-full bg-[#FF3D00] px-5 text-base font-black text-white shadow-[0_10px_22px_rgba(255,61,0,0.24)]"
          onClick={() => router.replace("/home")}
          type="button"
        >
          확인
        </button>
      </section>
    </div>
  );
}
