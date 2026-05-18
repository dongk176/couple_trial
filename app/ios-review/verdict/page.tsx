import Link from "next/link";
import { ArrowLeft, CheckCircle2, Scale, Target, UsersRound } from "lucide-react";
import { reviewCases } from "@/lib/review-cases";

export default function IOSReviewVerdictPage() {
  const reviewCase = reviewCases[0];
  const plaintiffRate = Math.round((reviewCase.votesForPlaintiff / reviewCase.totalVotes) * 100);

  return (
    <div className="min-h-screen py-5">
      <header className="grid min-h-9 grid-cols-[32px_1fr_32px] items-center">
        <Link href={`/ios-review/cases/${reviewCase.id}`} aria-label="뒤로가기" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-950">
          <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.6} />
        </Link>
        <h1 className="text-center text-[18px] font-black text-neutral-950">판결 결과</h1>
        <span />
      </header>

      <section className="ios-card mt-5 p-4">
        <p className="text-[12px] font-black text-[#FF3D00]">사건</p>
        <h2 className="mt-2 text-[22px] font-black leading-8 text-neutral-950">{reviewCase.title}</h2>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-center">
            <p className="text-[11px] font-semibold text-[#767986]">최종 판결</p>
            <p className="mt-1 text-[26px] font-black text-[#FF3D00]">{reviewCase.finalVerdict}</p>
          </div>
          <span className="h-12 w-px bg-[#ECECF1]" />
          <div className="text-center">
            <p className="text-[11px] font-semibold text-[#767986]">최종 형량</p>
            <p className="mt-1 text-[21px] font-black text-neutral-950">{reviewCase.sentenceLabel}</p>
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 rounded-[14px] bg-[#FFF2EC] px-3 py-2 text-[12px] font-semibold text-[#333743]">
          <UsersRound aria-hidden="true" size={15} className="text-[#FF3D00]" />
          배심원 {reviewCase.totalVotes}명 중 <span className="font-black text-[#FF3D00]">{reviewCase.votesForPlaintiff}명</span>이 원고의 손을 들어줬습니다.
        </p>
      </section>

      <section className="ios-card mt-3 p-4">
        <h3 className="flex items-center gap-1.5 text-[16px] font-black text-neutral-950">
          AI 판결문 <Scale aria-hidden="true" size={16} className="text-[#FF3D00]" />
        </h3>
        <p className="mt-2 text-[13px] font-semibold leading-6 text-[#333743]">
          피고는 중요한 기념일을 반복적으로 놓쳐 원고에게 서운함과 실망감을 안겼습니다. 다만 고의적인 무시는 아니었고 재발 방지를 약속했으므로,
          본 법정은 원고 승과 함께 {reviewCase.sentenceLabel}을 선고합니다.
        </p>
      </section>

      <section className="mt-4">
        <h3 className="flex items-center gap-1.5 text-[16px] font-black text-neutral-950">
          감형 미션 <Target aria-hidden="true" size={16} className="text-[#FF3D00]" />
        </h3>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {reviewCase.missions.slice(0, 3).map((mission) => (
            <article key={mission.title} className="rounded-[16px] border border-[#ECECF1] bg-white p-3 text-center shadow-sm">
              <CheckCircle2 aria-hidden="true" size={22} className="mx-auto text-[#FF3D00]" />
              <h4 className="mt-2 text-[12px] font-black leading-4 text-neutral-950">{mission.title}</h4>
              <p className="mt-1 text-sm font-black text-[#FF3D00]">{mission.reduction}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[16px] border border-[#FFE0D4] bg-[#FFF8F4] p-3">
        <p className="text-xs font-black text-[#FF3D00]">배심 통계</p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-[#FF3D00]" style={{ width: `${plaintiffRate}%` }} />
        </div>
        <p className="mt-2 text-[11px] font-semibold leading-4 text-[#666A75]">
          배심원들의 선택을 바탕으로 판결 결과가 정리됩니다.
        </p>
      </section>
    </div>
  );
}
