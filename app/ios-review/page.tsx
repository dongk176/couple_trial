import Link from "next/link";
import { BookOpen, ChevronRight, FileText, LifeBuoy, Scale } from "lucide-react";
import { LogoMark } from "@/components/LogoMark";
import { reviewCases } from "@/lib/review-cases";

export default function IOSReviewPage() {
  const firstCase = reviewCases[0];

  return (
    <div className="min-h-screen py-5">
      <header className="flex items-center gap-2">
        <LogoMark size="sm" />
        <div>
          <h1 className="text-[20px] font-black leading-6 text-neutral-950">커플재판</h1>
        </div>
      </header>

      <section className="mt-5 rounded-[18px] border border-[#FFE0D4] bg-[#FFF8F4] p-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#FF3D00] shadow-sm">
            <Scale aria-hidden="true" size={20} strokeWidth={2.6} />
          </span>
          <div>
            <p className="text-[12px] font-black text-[#FF3D00]">커플 재판 체험</p>
            <h2 className="mt-1 text-[20px] font-black leading-7 text-neutral-950">
              공개 사건을 읽고
              <br />
              배심을 체험해보세요
            </h2>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#666A75]">
              실제 커플들의 이야기를 읽고, 당신의 시선으로 판결을 내려보세요.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-2">
        <Link href="/ios-review/cases" className="ios-card flex items-center gap-3 p-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#FFF2EC] text-[#FF3D00]">
            <BookOpen aria-hidden="true" size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-neutral-950">공개 사건 보기</span>
            <span className="mt-0.5 block text-[11px] font-semibold leading-4 text-[#767986]">
              인증 없이 읽을 수 있는 샘플 사건 {reviewCases.length}건
            </span>
          </span>
          <ChevronRight aria-hidden="true" size={18} className="text-[#9A9CAA]" />
        </Link>

        <Link href={`/ios-review/cases/${firstCase.id}`} className="ios-card flex items-center gap-3 p-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#FFF2EC] text-[#FF3D00]">
            <Scale aria-hidden="true" size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-neutral-950">사건 상세 체험</span>
            <span className="mt-0.5 block truncate text-[11px] font-semibold leading-4 text-[#767986]">
              {firstCase.title}
            </span>
          </span>
          <ChevronRight aria-hidden="true" size={18} className="text-[#9A9CAA]" />
        </Link>

        <Link href="/ios-review/verdict" className="ios-card flex items-center gap-3 p-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#FFF2EC] text-[#FF3D00]">
            <FileText aria-hidden="true" size={19} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-neutral-950">판결 결과 예시</span>
            <span className="mt-0.5 block text-[11px] font-semibold leading-4 text-[#767986]">
              배심 통계와 감형 미션을 확인합니다
            </span>
          </span>
          <ChevronRight aria-hidden="true" size={18} className="text-[#9A9CAA]" />
        </Link>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-2">
        <Link href="/privacy" className="rounded-[16px] border border-[#ECECF1] bg-white p-3 text-center text-xs font-black text-neutral-950 shadow-sm">
          개인정보 처리방침
        </Link>
        <Link href="/support" className="rounded-[16px] border border-[#ECECF1] bg-white p-3 text-center text-xs font-black text-neutral-950 shadow-sm">
          고객지원
        </Link>
        <Link href="/terms" className="rounded-[16px] border border-[#ECECF1] bg-white p-3 text-center text-xs font-black text-neutral-950 shadow-sm">
          이용약관
        </Link>
        <a
          href="mailto:support@coupletrial.com"
          className="rounded-[16px] border border-[#ECECF1] bg-white p-3 text-center text-xs font-black text-neutral-950 shadow-sm"
        >
          <span className="inline-flex items-center gap-1">
            <LifeBuoy aria-hidden="true" size={14} />
            문의하기
          </span>
        </a>
      </section>
    </div>
  );
}
