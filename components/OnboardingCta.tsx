import Link from "next/link";
import { AppleLoginButton } from "@/components/AppleLoginButton";
import { primaryButtonClass } from "@/components/PrimaryButton";

export function OnboardingCta({ signupHref = "/signup", loginHref = "/login" }: { signupHref?: string; loginHref?: string }) {
  return (
    <section className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[430px] space-y-2 bg-white px-4 pb-[calc(14px+env(safe-area-inset-bottom))] pt-3">
      <AppleLoginButton />
      <Link href={signupHref} className={`${primaryButtonClass} w-full !min-h-11 !rounded-[14px] !py-3 !text-sm !text-white`}>
        기본 회원가입
      </Link>
      <p className="pt-1 text-center text-xs font-semibold text-[#767986]">
        이미 계정이 있으신가요?{" "}
        <Link href={loginHref} className="font-black text-[#FF3D00]">
          로그인
        </Link>
      </p>
    </section>
  );
}
