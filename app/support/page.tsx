import Link from "next/link";
import { Mail, ShieldAlert, ShieldCheck, Wrench } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { LogoMark } from "@/components/LogoMark";

const supportItems = [
  {
    icon: Wrench,
    title: "서비스 이용 문의",
    body: "로그인, 커플 연결, 사건 열람, 배심 체험 등 서비스 이용 중 불편한 점을 확인합니다."
  },
  {
    icon: ShieldAlert,
    title: "신고 및 안전 문의",
    body: "개인정보 노출, 비방, 허위 사건, 차단 요청 등 안전 관련 문의를 접수합니다."
  },
  {
    icon: ShieldCheck,
    title: "개인정보 문의",
    body: "개인정보 열람, 정정, 삭제, 처리 정지 요청을 본인 확인 후 처리합니다."
  }
];

export default function SupportPage() {
  return (
    <div className="min-h-screen py-6">
      <header className="grid min-h-9 grid-cols-[32px_1fr_32px] items-center">
        <BackButton href="/" />
        <Link href="/" className="mx-auto inline-flex min-h-8 items-center gap-1.5 text-[18px] font-black text-neutral-950">
          <LogoMark size="sm" />
          커플재판
        </Link>
        <span />
      </header>

      <section className="pt-6">
        <p className="text-xs font-black text-[#FF3D00]">고객지원</p>
        <h1 className="mt-2 text-[24px] font-black leading-tight text-neutral-950">
          도움이 필요하신가요?
        </h1>
        <p className="mt-3 text-xs font-semibold leading-5 text-[#767986]">
          커플재판 이용 중 궁금한 점이나 신고가 필요한 내용을 운영팀에 알려주세요.
        </p>
      </section>

      <section className="mt-5 rounded-[18px] border border-[#FFE0D4] bg-[#FFF8F4] p-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#FF3D00] shadow-sm">
            <Mail aria-hidden="true" size={20} />
          </span>
          <div>
            <h2 className="text-[16px] font-black text-neutral-950">이메일 문의</h2>
            <a href="mailto:support@coupletrial.com" className="mt-1 block text-sm font-black text-[#FF3D00]">
              support@coupletrial.com
            </a>
            <p className="mt-2 text-xs font-semibold leading-5 text-[#666A75]">
              영업일 기준 2~3일 이내 답변을 목표로 합니다. 문의 시 계정 아이디, 발생 화면, 오류 내용을 함께 보내주시면 더 빠르게 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-4 space-y-3">
        {supportItems.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="ios-card p-4">
              <h2 className="flex items-center gap-2 text-[16px] font-black text-neutral-950">
                <Icon aria-hidden="true" size={18} className="text-[#FF3D00]" />
                {item.title}
              </h2>
              <p className="mt-2 text-[13px] font-semibold leading-6 text-[#555965]">{item.body}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-4 rounded-[16px] border border-[#ECECF1] bg-white p-4">
        <h2 className="text-[15px] font-black text-neutral-950">사업자 정보</h2>
        <dl className="mt-2 space-y-1 text-xs font-semibold leading-5 text-[#666A75]">
          <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#8A8D98]">상호</dt><dd>아티룸</dd></div>
          <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#8A8D98]">대표</dt><dd>김동민</dd></div>
          <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#8A8D98]">사업자등록번호</dt><dd>638-04-03590</dd></div>
          <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#8A8D98]">통신판매업</dt><dd>2025-서울마포-2971</dd></div>
          <div className="flex gap-2"><dt className="w-24 shrink-0 text-[#8A8D98]">주소</dt><dd>서울특별시 마포구 성산로8길 40</dd></div>
        </dl>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link href="/privacy" className="rounded-[16px] border border-[#ECECF1] bg-white p-3 text-center text-xs font-black text-neutral-950 shadow-sm">
          개인정보 처리방침
        </Link>
        <Link href="/terms" className="rounded-[16px] border border-[#ECECF1] bg-white p-3 text-center text-xs font-black text-neutral-950 shadow-sm">
          이용약관
        </Link>
      </div>
    </div>
  );
}
