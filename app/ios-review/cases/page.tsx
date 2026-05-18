import Link from "next/link";
import { ArrowLeft, ChevronRight, Eye, Scale, UsersRound } from "lucide-react";
import { reviewCases } from "@/lib/review-cases";

export default function IOSReviewCasesPage() {
  return (
    <div className="min-h-screen py-5">
      <header className="grid min-h-9 grid-cols-[32px_1fr_32px] items-center">
        <Link href="/ios-review" aria-label="뒤로가기" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-950">
          <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.6} />
        </Link>
        <h1 className="text-center text-[18px] font-black text-neutral-950">공개 사건</h1>
        <span />
      </header>

      <section className="mt-5 rounded-[18px] border border-[#FFE0D4] bg-[#FFF8F4] p-3">
        <p className="text-xs font-black text-[#FF3D00]">투표 가능한 사건수: {reviewCases.length}건</p>
      </section>

      <section className="mt-3 space-y-2">
        {reviewCases.map((reviewCase) => (
          <Link key={reviewCase.id} href={`/ios-review/cases/${reviewCase.id}`} className="ios-card flex items-center gap-2.5 p-2.5">
            <div className="flex h-[78px] w-[78px] shrink-0 flex-col items-center justify-center rounded-[16px] bg-[#FFF2EC] text-[#FF3D00]">
              <Scale aria-hidden="true" size={24} strokeWidth={2.3} />
              <span className="mt-1 text-[10px] font-black">{reviewCase.category}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-black text-[#FF3D00]">{reviewCase.category}</p>
              <h2 className="mt-0.5 truncate text-[15px] font-black leading-5 text-neutral-950">{reviewCase.title}</h2>
              <p className="mt-1 flex items-center gap-1 text-[12px] font-black text-[#FF3D00]">
                <Scale aria-hidden="true" size={13} />
                {reviewCase.finalVerdict}
              </p>
              <p className="mt-1 flex min-w-0 items-center gap-2 text-[11px] font-semibold text-[#767986]">
                <span className="inline-flex items-center gap-1">
                  <UsersRound aria-hidden="true" size={12} />
                  {reviewCase.totalVotes}명
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye aria-hidden="true" size={12} />
                  {reviewCase.views}
                </span>
              </p>
            </div>
            <ChevronRight aria-hidden="true" size={17} className="shrink-0 text-[#9A9CAA]" />
          </Link>
        ))}
      </section>
    </div>
  );
}
