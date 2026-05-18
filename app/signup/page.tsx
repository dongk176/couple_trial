import Link from "next/link";
import { redirect } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { LogoMark } from "@/components/LogoMark";
import { SignupForm } from "@/components/SignupForm";
import { getCurrentUser } from "@/lib/auth";

const errors: Record<string, string> = {
  required: "필수 정보를 모두 입력하세요.",
  duplicate: "이미 사용 중인 아이디입니다.",
  avatar: "프로필 이미지를 다시 선택하세요.",
  upload: "프로필 이미지 업로드 저장소 설정이 필요해요."
};

export default async function SignupPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/home");
  const params = await searchParams;
  const error = params?.error ? errors[params.error] : null;

  return (
    <div className="min-h-screen overflow-x-hidden py-6">
      <div className="flex items-center justify-between">
        <BackButton href="/" />
        <Link href="/" className="inline-flex min-h-8 items-center gap-1.5 text-[20px] font-black text-neutral-950">
          <LogoMark size="sm" />
          커플재판
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-[18px] border border-[#FFD6C8] bg-[#FFF2EC] px-4 py-3 text-sm font-bold text-[#F04411]">
          {error}
        </div>
      ) : null}

      <SignupForm />

      <p className="mt-4 text-center text-xs font-semibold text-[#767986]">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-black text-[#FF3D00]">
          로그인
        </Link>
      </p>
    </div>
  );
}
