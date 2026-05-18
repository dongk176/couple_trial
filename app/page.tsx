import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Heart, ShieldCheck } from "lucide-react";
import { AiVerdictIcon, JuryIcon, PublicCaseIcon } from "@/components/FeatureIcons";
import { LogoMark } from "@/components/LogoMark";
import { StartGavelButton } from "@/components/StartGavelButton";
import { getCurrentUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/home");

  const cards = [
    { title: "공개 사건", body: "모든 사건은 공개 피드에 등록됩니다.", icon: PublicCaseIcon },
    { title: "배심원 참여", body: "가입한 유저가 100명까지 투표합니다.", icon: JuryIcon },
    { title: "AI 판결", body: "투표가 끝나면 판결문과 형량을 생성합니다.", icon: AiVerdictIcon }
  ];

  return (
    <div className="min-h-screen overflow-x-hidden pb-40 pt-6">
      <section className="relative min-h-[260px] overflow-hidden">
        <div className="flex items-center gap-2">
          <LogoMark size="md" />
          <h1 className="text-[26px] font-black leading-none text-neutral-950">커플법정</h1>
        </div>
        <h2 className="relative z-10 mt-10 max-w-[250px] text-[30px] font-black leading-[1.25] text-neutral-950">
          남의 연애 사건,
          <br />
          <span className="text-[#FF3D00]">당신이</span> 판결하세요
        </h2>
        <p className="relative z-10 mt-4 max-w-[210px] py-2 text-[15px] font-semibold leading-6 text-[#666A75]">
          커플들의 이야기를 읽고, 당신의 판결을 내려주세요.
        </p>
        <Image
          src="/onboarding/on%201.png"
          alt="판사봉과 재판 이미지"
          width={260}
          height={260}
          priority
          className="absolute right-[-22px] top-[70px] h-[210px] w-[210px] max-w-none object-contain"
        />
      </section>

      <section className="mt-4">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Heart aria-hidden="true" className="fill-[#FF3D00] text-[#FF3D00]" size={14} />
          <h3 className="text-base font-black text-neutral-950">커플법정에서 할 수 있는 것</h3>
          <Heart aria-hidden="true" className="fill-[#FF3D00] text-[#FF3D00]" size={14} />
        </div>
        <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="ios-card flex min-h-[124px] flex-col items-center justify-center p-2.5 text-center"
            >
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF2EC] [&>svg]:h-12 [&>svg]:w-12">
                <Icon />
              </span>
              <strong className="mt-3 block text-[14px] font-black leading-5 text-neutral-950">{card.title}</strong>
              <span className="mt-1.5 block text-[11px] font-semibold leading-4 text-[#666A75]">{card.body}</span>
            </div>
          );
        })}
        </div>
      </section>

      <section className="mt-5 flex items-center gap-3 rounded-[16px] border border-[#FFD6C8] bg-[#FFF8F4] p-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#FF3D00] shadow-[0_8px_20px_rgba(17,17,17,0.08)]">
          <ShieldCheck aria-hidden="true" size={20} strokeWidth={2.5} />
        </span>
        <div>
          <h3 className="text-[15px] font-black text-neutral-950">익명으로, 솔직하게</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#666A75]">걱정 없이 자유롭게 의견을 남길 수 있어요.</p>
        </div>
      </section>

      <section className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] bg-white px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
        <StartGavelButton />
        <p className="mt-3 text-center text-sm font-semibold text-[#767986]">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="font-black text-[#FF3D00]">
            로그인
          </Link>
        </p>
      </section>
    </div>
  );
}
