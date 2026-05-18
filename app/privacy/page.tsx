import Link from "next/link";
import { BackButton } from "@/components/BackButton";
import { LogoMark } from "@/components/LogoMark";

const sections = [
  {
    title: "1. 수집하는 개인정보",
    body: [
      "커플재판은 회원가입과 서비스 제공을 위해 아이디, 비밀번호 해시값, 닉네임, 프로필 이미지, 이름, 성별, 생년월일, 전화번호를 수집합니다.",
      "서비스 이용 과정에서 커플 연결 정보, 초대코드, 사건 제목과 내용, 원고 주장, 피고 답변, 사건 사진, 댓글과 답글, 배심 투표, 판결 기록, 신고 및 차단 내역, 알림 내역이 생성될 수 있습니다.",
      "로그인 유지와 보안을 위해 httpOnly 세션 쿠키가 사용되며, 접속 일시, 브라우저 정보, 서비스 이용 기록 등 기본적인 로그 정보가 자동으로 처리될 수 있습니다."
    ]
  },
  {
    title: "2. 개인정보 이용 목적",
    body: [
      "회원 식별, 로그인 유지, 중복 가입 방지, 커플 연결, 공개 사건 등록, 배심 투표, AI 요약 및 판결문 생성, 판결 기록 관리, 알림 제공, 신고 처리, 부정 이용 방지, 서비스 품질 개선을 위해 개인정보를 이용합니다.",
      "전화번호는 재판 마감, 답변 요청, 판결 결과 등 주요 재판 알림톡 제공을 위한 목적으로 사용할 수 있습니다."
    ]
  },
  {
    title: "3. 공개 사건과 게시물 안내",
    body: [
      "커플재판의 사건은 기본적으로 공개 피드에 등록됩니다. 사건 제목, 카테고리, 사건 내용, 원고 주장, 피고 답변, AI 요약, 댓글, 배심 통계는 다른 이용자에게 노출될 수 있습니다.",
      "사건이나 댓글에 본인 또는 타인의 전화번호, 주소, 계좌번호, 주민등록번호, 직장명 등 직접 식별 가능한 개인정보를 포함하지 않도록 주의해주세요.",
      "개인정보 노출, 욕설, 허위 사실, 명예훼손 가능성이 있는 게시물은 신고 또는 운영자 검토를 통해 숨김 처리될 수 있습니다."
    ]
  },
  {
    title: "4. 보관 기간",
    body: [
      "회원 정보는 회원 탈퇴 또는 서비스 종료 시까지 보관합니다. 단, 분쟁 대응, 부정 이용 방지, 신고 처리, 관계 법령 준수를 위해 필요한 정보는 합리적인 기간 동안 별도로 보관할 수 있습니다.",
      "사건, 투표, 판결, 댓글 등 서비스 활동 기록은 공개 재판의 맥락과 판결 기록 유지를 위해 회원 탈퇴 후에도 익명화 또는 비식별 처리된 형태로 남을 수 있습니다."
    ]
  },
  {
    title: "5. 제3자 제공 및 처리 위탁",
    body: [
      "커플재판은 이용자의 개인정보를 사전 동의 없이 외부에 판매하거나 임의로 제공하지 않습니다.",
      "서비스 운영을 위해 데이터베이스, 배포, 파일 저장, 알림 발송 등 인프라 사업자에게 개인정보 처리를 위탁할 수 있습니다. 현재 서비스 운영에는 Supabase, Vercel, AWS S3 등 클라우드 인프라가 사용될 수 있습니다.",
      "AI 요약과 판결 기능은 서비스 내 자동 처리 로직을 통해 제공되며, 외부 AI API로 사건 내용을 전송하는 기능을 도입하는 경우 필요한 범위와 목적을 고지하고 보호 조치를 적용합니다."
    ]
  },
  {
    title: "6. 개인정보의 파기",
    body: [
      "보관 목적이 달성되거나 보관 기간이 종료된 개인정보는 복구하기 어려운 방법으로 파기합니다.",
      "전자 파일은 안전한 삭제 방식으로 삭제하고, 출력물 등 물리적 자료가 발생하는 경우 분쇄 또는 이에 준하는 방법으로 파기합니다."
    ]
  },
  {
    title: "7. 이용자의 권리",
    body: [
      "이용자는 본인의 개인정보에 대해 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다.",
      "서비스 내에서 직접 수정할 수 없는 정보의 변경이나 삭제가 필요한 경우 운영팀에 요청할 수 있으며, 커플재판은 본인 확인 후 합리적인 기간 내에 처리합니다.",
      "다른 이용자의 권리나 공개 재판 기록의 무결성을 침해할 우려가 있는 요청은 법령과 서비스 운영 기준에 따라 제한될 수 있습니다."
    ]
  },
  {
    title: "8. 안전성 확보 조치",
    body: [
      "비밀번호는 평문으로 저장하지 않고 해시 처리하여 보관합니다.",
      "로그인 세션은 httpOnly 쿠키를 사용하여 보호하고, 데이터베이스 접근 권한과 운영 환경변수는 필요한 범위로 제한합니다.",
      "프로필 이미지와 사건 사진 등 업로드 파일은 허용된 이미지 형식과 용량 제한을 적용하며, 서비스 운영에 필요한 저장소에 보관합니다."
    ]
  },
  {
    title: "9. 만 14세 미만 이용자",
    body: [
      "커플재판은 만 14세 미만 아동을 대상으로 서비스를 제공하지 않습니다. 만 14세 미만 이용자의 가입 사실이 확인되는 경우 계정 이용이 제한되거나 관련 정보가 삭제될 수 있습니다."
    ]
  },
  {
    title: "10. 문의",
    body: [
      "개인정보 처리와 관련한 문의, 신고, 삭제 요청은 커플재판 운영팀으로 연락해주세요.",
      "이메일: support@coupletrial.com"
    ]
  }
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-6">
      <div className="grid min-h-9 grid-cols-[32px_1fr_32px] items-center">
        <BackButton href="/signup" />
        <Link href="/" className="mx-auto inline-flex min-h-8 items-center gap-1.5 text-[18px] font-black text-neutral-950">
          <LogoMark size="sm" />
          커플재판
        </Link>
        <span />
      </div>

      <section className="pt-6">
        <p className="text-xs font-black text-[#FF3D00]">개인정보 처리방침</p>
        <h1 className="mt-2 text-[24px] font-black leading-tight text-neutral-950">
          이용자의 정보를
          <br />
          안전하게 다룹니다
        </h1>
        <p className="mt-3 text-xs font-semibold leading-5 text-[#767986]">
          커플재판은 서비스 제공에 필요한 최소한의 개인정보를 수집하고, 목적에 맞게 안전하게 처리합니다.
        </p>
        <p className="mt-3 inline-flex rounded-full bg-[#FFF2EC] px-3 py-1.5 text-xs font-black text-[#FF3D00]">
          시행일 2026년 5월 18일
        </p>
      </section>

      <section className="mt-5 space-y-3">
        {sections.map((section) => (
          <article key={section.title} className="ios-card p-4">
            <h2 className="text-[16px] font-black leading-6 text-neutral-950">{section.title}</h2>
            <div className="mt-2 space-y-2">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-[13px] font-semibold leading-6 text-[#555965]">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="mt-4 rounded-[16px] border border-[#FFD6C8] bg-[#FFF8F4] p-4">
        <h2 className="text-[15px] font-black text-neutral-950">개정 안내</h2>
        <p className="mt-2 text-xs font-semibold leading-5 text-[#666A75]">
          개인정보 처리방침이 변경되는 경우 서비스 화면 또는 알림을 통해 변경 내용과 시행일을 안내합니다.
        </p>
      </section>
    </div>
  );
}
