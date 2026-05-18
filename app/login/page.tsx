import Link from "next/link";
import { redirect } from "next/navigation";
import { BackButton } from "@/components/BackButton";
import { LogoMark } from "@/components/LogoMark";
import { login } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";
import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/home");
  const params = await searchParams;
  const error = params?.error === "invalid" ? "아이디 또는 비밀번호가 올바르지 않습니다." : null;

  return (
    <div className="min-h-screen py-6">
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

      <form action={login} className="mt-8 space-y-3">
        <div>
          <h1 className="text-[18px] font-black leading-tight text-neutral-950">로그인</h1>
          <p className="mt-1.5 text-xs font-semibold leading-4 text-[#767986]">아이디와 비밀번호로 이어가기</p>
        </div>

        <FormInput
          label="아이디"
          labelClassName="text-[13px]"
          name="loginId"
          autoComplete="username"
          placeholder="예: minji"
          className="mt-1 rounded-[10px] px-3 py-2 text-xs"
          required
        />
        <FormInput
          label="비밀번호"
          labelClassName="text-[13px]"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호"
          className="mt-1 rounded-[10px] px-3 py-2 text-xs"
          required
        />
        <PrimaryButton type="submit" className="w-full !min-h-11 !rounded-[12px] !py-2.5 !text-sm">
          로그인
        </PrimaryButton>
      </form>

      <div className="mt-4 rounded-[14px] border border-[#E8E8ED] bg-[#F8F8FA] px-3 py-2.5 text-xs font-semibold leading-5 text-[#666A75]">
        데모 계정: <strong className="text-neutral-950">minji / demo1234</strong>
      </div>

      <p className="mt-5 text-center text-xs font-semibold text-[#767986]">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-black text-[#FF3D00]">
          회원가입
        </Link>
      </p>
    </div>
  );
}
