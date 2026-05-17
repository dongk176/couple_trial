import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { LogoMark } from "@/components/LogoMark";
import { signup } from "@/lib/actions";
import { AVATAR_OPTIONS } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";

const errors: Record<string, string> = {
  required: "아이디, 비밀번호, 닉네임을 모두 입력하세요.",
  duplicate: "이미 사용 중인 아이디입니다.",
  avatar: "프로필 이미지를 다시 선택하세요."
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
    <div className="min-h-screen py-6">
      <div className="flex items-center justify-between">
        <BackButton href="/" />
        <Link href="/" className="inline-flex min-h-8 items-center gap-1.5 text-[20px] font-black text-neutral-950">
          <LogoMark size="sm" />
          커플법정
        </Link>
      </div>

      {error ? (
        <div className="mt-6 rounded-[18px] border border-[#FFD6C8] bg-[#FFF2EC] px-4 py-3 text-sm font-bold text-[#F04411]">
          {error}
        </div>
      ) : null}

      <form action={signup} className="mt-5 space-y-3">
        <div>
          <h1 className="text-[18px] font-black leading-tight text-neutral-950">계정 만들기</h1>
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
          autoComplete="new-password"
          placeholder="비밀번호"
          className="mt-1 rounded-[10px] px-3 py-2 text-xs"
          minLength={6}
          required
        />
        <FormInput
          label="닉네임"
          labelClassName="text-[13px]"
          name="nickname"
          placeholder="예: 냉철한 민지"
          className="mt-1 rounded-[10px] px-3 py-2 text-xs"
          required
        />

        <fieldset>
          <legend className="text-[13px] font-black text-neutral-950">프로필 이미지 <span className="font-semibold text-[#767986]">(선택)</span></legend>
          <div className="mt-2 flex gap-2.5 overflow-x-auto pb-1">
            <label className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-dashed border-[#B8BCC8] bg-white text-[#767986] shadow-sm">
              <input
                className="sr-only"
                type="file"
                name="avatarUpload"
                accept="image/jpeg,image/png,image/webp,image/gif"
              />
              <Plus aria-hidden="true" size={19} strokeWidth={2.4} />
            </label>
            {AVATAR_OPTIONS.map((avatar, index) => (
              <label
                key={avatar}
                className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#E8E8ED] bg-white shadow-sm has-[:checked]:border-[#FF3D00] has-[:checked]:ring-2 has-[:checked]:ring-[#FF3D00]/12"
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="avatar"
                  value={avatar}
                  defaultChecked={index === 0}
                  required
                />
                <Image
                  src={avatar}
                  alt={`프로필 이미지 ${index + 1}`}
                  width={48}
                  height={48}
                  className="h-full w-full rounded-full object-cover"
                />
              </label>
            ))}
          </div>
        </fieldset>

        <PrimaryButton type="submit" className="w-full !min-h-11 !rounded-[12px] !py-2.5 !text-sm">
          가입하고 시작
        </PrimaryButton>
      </form>

      <p className="mt-4 text-center text-xs font-semibold text-[#767986]">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-black text-[#FF3D00]">
          로그인
        </Link>
      </p>
    </div>
  );
}
