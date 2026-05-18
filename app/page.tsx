import Image from "next/image";
import { redirect } from "next/navigation";
import { Heart, ShieldCheck } from "lucide-react";
import { AiVerdictIcon, JuryIcon, PublicCaseIcon } from "@/components/FeatureIcons";
import { LogoMark } from "@/components/LogoMark";
import { OnboardingCta } from "@/components/OnboardingCta";
import { getCurrentUser } from "@/lib/auth";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/home");
  const signupHref = "/signup";
  const loginHref = "/login";

  const cards = [
    { title: "공개 사건", body: "모든 사건은 공개 피드에 등록됩니다.", icon: PublicCaseIcon },
    { title: "배심원 참여", body: "가입한 유저가 100명까지 투표합니다.", icon: JuryIcon },
    { title: "AI 판결", body: "투표가 끝나면 판결문과 형량을 생성합니다.", icon: AiVerdictIcon }
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 top-0 mx-auto h-[100dvh] w-full max-w-[430px] overflow-hidden bg-white px-4 pb-[142px] pt-5 sm:px-5">
      <section className="relative min-h-[232px] overflow-hidden">
        <div className="flex items-center gap-2">
          <LogoMark size="md" />
          <h1 className="text-[26px] font-black leading-none text-neutral-950">커플재판</h1>
        </div>
        <h2 className="relative z-10 mt-8 max-w-[250px] text-[28px] font-black leading-[1.22] text-neutral-950">
          남의 연애 사건,
          <br />
          <span className="text-[#FF3D00]">당신이</span> 판결하세요
        </h2>
        <p className="relative z-10 mt-3 max-w-[210px] py-2 text-[14px] font-semibold leading-5 text-[#666A75]">
          커플들의 이야기를 읽고, 당신의 판결을 내려주세요.
        </p>
        <Image
          src="/onboarding/on%201.png"
          alt="판사봉과 재판 이미지"
          width={260}
          height={260}
          priority
          className="absolute right-[-18px] top-[62px] h-[198px] w-[198px] max-w-none object-contain"
        />
      </section>

      <section className="mt-3">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Heart aria-hidden="true" className="fill-[#FF3D00] text-[#FF3D00]" size={14} />
          <h3 className="text-base font-black text-neutral-950">커플재판에서 할 수 있는 것</h3>
          <Heart aria-hidden="true" className="fill-[#FF3D00] text-[#FF3D00]" size={14} />
        </div>
        <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="ios-card flex min-h-[112px] flex-col items-center justify-center p-2 text-center"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF2EC] [&>svg]:h-11 [&>svg]:w-11">
                <Icon />
              </span>
              <strong className="mt-2 block text-[13px] font-black leading-5 text-neutral-950">{card.title}</strong>
              <span className="mt-1 block text-[10.5px] font-semibold leading-4 text-[#666A75]">{card.body}</span>
            </div>
          );
        })}
        </div>
      </section>

      <section className="mt-3 flex items-center gap-3 rounded-[16px] border border-[#FFD6C8] bg-[#FFF8F4] p-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#FF3D00] shadow-[0_8px_20px_rgba(17,17,17,0.08)]">
          <ShieldCheck aria-hidden="true" size={20} strokeWidth={2.5} />
        </span>
        <div>
          <h3 className="text-[15px] font-black text-neutral-950">익명으로, 솔직하게</h3>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#666A75]">걱정 없이 자유롭게 의견을 남길 수 있어요.</p>
        </div>
      </section>

      <OnboardingCta signupHref={signupHref} loginHref={loginHref} />
    </div>
  );
}
