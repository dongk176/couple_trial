import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { LogoMark } from "@/components/LogoMark";

const terms = [
  {
    title: "1. 목적",
    body: "본 약관은 커플재판이 제공하는 공개 사건 열람, 배심 참여, 판결 결과 확인 등 서비스 이용 조건과 운영 기준을 정합니다."
  },
  {
    title: "2. 서비스 성격",
    body: "커플재판의 배심 결과와 판결문은 커플 간 갈등을 가볍게 정리하기 위한 엔터테인먼트 성격의 콘텐츠이며, 실제 법률 판단이나 법적 효력을 갖지 않습니다."
  },
  {
    title: "3. 회원과 계정",
    body: "이용자는 정확한 정보를 바탕으로 계정을 생성해야 하며, 본인 계정에서 발생한 활동에 대한 관리 책임을 부담합니다."
  },
  {
    title: "4. 공개 사건과 게시물",
    body: "서비스에 등록된 사건은 공개될 수 있습니다. 이용자는 본인 또는 타인의 개인정보, 명예를 훼손할 수 있는 내용, 허위 사실, 욕설 또는 비방을 등록해서는 안 됩니다."
  },
  {
    title: "5. 신고와 운영 조치",
    body: "개인정보 노출, 권리 침해, 부적절한 게시물이 확인되는 경우 운영자는 게시물 숨김, 계정 제한, 신고 처리 등 필요한 조치를 할 수 있습니다."
  },
  {
    title: "6. 결제와 구독",
    body: "현재 서비스는 별도 구독 상품을 제공하지 않습니다. 유료 기능을 도입하는 경우 가격, 기간, 해지 조건을 명확히 고지합니다."
  },
  {
    title: "7. AI 기능",
    body: "AI 기능을 제공하는 경우 전송 항목, 제공받는 자, 이용 목적을 명확히 고지하고 필요한 동의를 받습니다."
  },
  {
    title: "8. 면책",
    body: "서비스는 커플 간 의사소통을 돕는 참고용 도구입니다. 이용자는 서비스 결과를 바탕으로 한 실제 관계 판단과 행동에 대해 스스로 책임을 집니다."
  },
  {
    title: "9. 약관 변경",
    body: "약관이 변경되는 경우 서비스 화면 또는 공지로 변경 내용과 시행일을 안내합니다."
  },
  {
    title: "10. 문의",
    body: "서비스 이용과 약관 관련 문의는 support@coupletrial.com 으로 연락할 수 있습니다."
  }
];

export default function TermsPage() {
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
        <p className="text-xs font-black text-[#FF3D00]">이용약관</p>
        <h1 className="mt-2 text-[24px] font-black leading-tight text-neutral-950">
          커플재판 서비스
          <br />
          이용 기준입니다
        </h1>
        <p className="mt-3 text-xs font-semibold leading-5 text-[#767986]">
          시행일 2026년 5월 18일
        </p>
      </section>

      <section className="mt-5 space-y-3">
        {terms.map((item) => (
          <article key={item.title} className="ios-card p-4">
            <h2 className="text-[16px] font-black leading-6 text-neutral-950">{item.title}</h2>
            <p className="mt-2 text-[13px] font-semibold leading-6 text-[#555965]">{item.body}</p>
          </article>
        ))}
      </section>


    </div>
  );
}
