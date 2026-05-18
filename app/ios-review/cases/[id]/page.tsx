import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, FileText, Scale, UsersRound } from "lucide-react";
import { getReviewCase, reviewCases } from "@/lib/review-cases";

export function generateStaticParams() {
  return reviewCases.map((reviewCase) => ({ id: reviewCase.id }));
}

export default async function IOSReviewCaseDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reviewCase = getReviewCase(id);
  if (!reviewCase) notFound();

  return (
    <div className="min-h-screen py-5">
      <header className="grid min-h-9 grid-cols-[32px_1fr_32px] items-center">
        <Link href="/ios-review/cases" aria-label="뒤로가기" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-950">
          <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.6} />
        </Link>
        <h1 className="text-center text-[18px] font-black text-neutral-950">사건 상세</h1>
        <span />
      </header>

      <section className="ios-card mt-5 p-4">
        <span className="inline-flex rounded-full bg-[#FFF2EC] px-2.5 py-1 text-[11px] font-black text-[#FF3D00]">
          {reviewCase.category}
        </span>
        <h2 className="mt-3 text-[22px] font-black leading-8 text-neutral-950">{reviewCase.title}</h2>
        <div className="mt-3 flex flex-wrap gap-3 text-[12px] font-semibold text-[#767986]">
          <span className="inline-flex items-center gap-1">
            <UsersRound aria-hidden="true" size={14} />
            배심 {reviewCase.totalVotes}명
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye aria-hidden="true" size={14} />
            조회 {reviewCase.views}
          </span>
          <span className="inline-flex items-center gap-1">
            <Scale aria-hidden="true" size={14} />
            {reviewCase.finalVerdict}
          </span>
        </div>
        <p className="mt-3 rounded-[14px] bg-[#F7F7F9] px-3 py-2 text-[12px] font-semibold leading-5 text-[#555965]">
          <span className="font-black text-neutral-950">AI 요약 </span>
          {reviewCase.summary}
        </p>
      </section>

      <section className="mt-3 grid gap-2">
        <article className="ios-card p-4">
          <h3 className="flex items-center gap-1.5 text-[15px] font-black text-[#FF3D00]">
            <FileText aria-hidden="true" size={16} />
            원고 주장
          </h3>
          <p className="mt-2 text-[13px] font-semibold leading-6 text-[#333743]">{reviewCase.plaintiff}</p>
        </article>
        <article className="ios-card p-4">
          <h3 className="flex items-center gap-1.5 text-[15px] font-black text-[#3366E8]">
            <FileText aria-hidden="true" size={16} />
            피고 답변
          </h3>
          <p className="mt-2 text-[13px] font-semibold leading-6 text-[#333743]">{reviewCase.defendant}</p>
        </article>
      </section>

      <section className="ios-card mt-3 p-4">
        <h3 className="text-[16px] font-black text-neutral-950">배심 선택</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {["원고 승", "피고 승", "쌍방과실", "무죄"].map((option) => (
            <span
              key={option}
              className={`inline-flex min-h-10 items-center justify-center rounded-[12px] border px-3 text-xs font-black ${
                option === reviewCase.finalVerdict
                  ? "border-[#FF3D00] bg-[#FFF2EC] text-[#FF3D00]"
                  : "border-[#ECECF1] bg-white text-[#555965]"
              }`}
            >
              {option}
            </span>
          ))}
        </div>
      </section>

      <Link
        href="/ios-review/verdict"
        className="brand-gradient mt-4 flex min-h-11 items-center justify-center rounded-[14px] text-sm font-black text-white shadow-[0_8px_18px_rgba(255,61,0,0.22)]"
      >
        판결 결과 예시 보기
      </Link>
    </div>
  );
}
