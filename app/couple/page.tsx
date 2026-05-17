import Link from "next/link";
import { FilePlus2, HeartHandshake, KeyRound, Link2 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { UserAvatar } from "@/components/UserAvatar";
import { connectCouple } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getUserCouple, getUserInviteCode } from "@/lib/services";

const errors: Record<string, string> = {
  already: "이미 커플 연결이 완료됐습니다.",
  invalid: "초대코드 또는 아이디를 확인하세요.",
  selfInvite: "내 초대코드는 상대방 계정에서 입력해야 합니다.",
  targetConnected: "상대방은 이미 다른 커플 법정에 연결돼 있습니다."
};

export default async function CouplePage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; from?: string }>;
}) {
  const user = await requireUser();
  const [couple, inviteCode] = await Promise.all([getUserCouple(user.id), getUserInviteCode(user.id)]);
  const params = await searchParams;
  const error = params?.error ? errors[params.error] : null;
  const fromCase = params?.from === "case";
  const isConnected = couple?.status === "CONNECTED";

  return (
    <div className={isConnected ? "pb-28" : ""}>
      <AppHeader avatar={user.avatar} nickname={user.nickname} title="커플 연결" backHref="/home" />

      <section className="pt-3">
        <h1 className="text-3xl font-black text-neutral-950">커플 법정</h1>
        <p className="mt-2 text-base leading-6 text-neutral-500">초대코드 또는 상대방 아이디로 연결하면 사건을 등록할 수 있습니다.</p>
      </section>

      {fromCase ? (
        <div className="mt-5 rounded-[16px] border border-[#FFD6C8] bg-[#FFF2EC] p-4 text-sm font-bold leading-6 text-[#D93400]">
          사건 등록은 커플 연결 후 이용할 수 있습니다.
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-[18px] border border-[#FFD6C8] bg-[#FFF2EC] px-4 py-3 text-sm font-bold text-[#F04411]">
          {error}
        </div>
      ) : null}

      {isConnected ? (
        <>
          <section className="mt-6 rounded-[18px] border border-[#E8E8ED] bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FFF2EC] text-[#FF3D00]">
              <HeartHandshake aria-hidden="true" size={25} />
            </div>
            <h2 className="mt-4 text-2xl font-black text-neutral-950">연결 완료</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">이 커플 법정에서 등록되는 사건은 모두 공개 피드에 올라갑니다.</p>
            <div className="mt-5 flex items-center gap-3 rounded-[16px] bg-neutral-50 p-4">
              <UserAvatar src={couple.userA.avatar} alt={`${couple.userA.nickname} 프로필`} />
              <div className="min-w-0 flex-1 text-center text-sm font-black text-neutral-400">연결</div>
              {couple.userB ? <UserAvatar src={couple.userB.avatar} alt={`${couple.userB.nickname} 프로필`} /> : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="rounded-[16px] bg-neutral-50 p-4">
                <p className="text-sm font-bold text-neutral-500">원고 가능</p>
                <p className="mt-1 text-lg font-black text-neutral-950">{couple.userA.nickname}</p>
              </div>
              <div className="rounded-[16px] bg-neutral-50 p-4">
                <p className="text-sm font-bold text-neutral-500">피고 가능</p>
                <p className="mt-1 text-lg font-black text-neutral-950">{couple.userB?.nickname}</p>
              </div>
            </div>
          </section>

          <div className="fixed inset-x-0 bottom-[92px] z-50 mx-auto w-full max-w-[430px] px-5">
            <div className="rounded-[18px] border border-[#E8E8ED] bg-white/95 p-3 shadow-[0_18px_42px_rgba(0,0,0,0.16)] backdrop-blur-xl">
              <Link
                href="/cases/new"
                className="flex min-h-[58px] w-full items-center justify-center gap-2 rounded-full bg-[#FF3D00] px-5 text-base font-black text-white shadow-[0_10px_22px_rgba(255,61,0,0.24)]"
              >
                <FilePlus2 aria-hidden="true" size={21} strokeWidth={2.6} />
                사건 등록
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-6 space-y-5">
          <section className="rounded-[18px] border border-[#E8E8ED] bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FFF2EC] text-[#FF3D00]">
                <KeyRound aria-hidden="true" size={24} />
              </span>
              <div>
                <h2 className="text-xl font-black text-neutral-950">내 초대코드</h2>
                <p className="text-sm font-semibold text-neutral-500">상대방에게 6자리 코드를 공유하세요.</p>
              </div>
            </div>
            <div className="mt-5 rounded-[16px] bg-neutral-950 px-5 py-6 text-center text-3xl font-black tracking-[0.16em] text-white">
              {inviteCode}
            </div>
            <p className="mt-3 text-sm font-bold leading-6 text-neutral-500">
              이 코드는 내 아이디 전용 코드입니다. 상대방 계정에서 입력해야 연결됩니다.
            </p>
          </section>

          <section className="rounded-[18px] border border-[#E8E8ED] bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FFF2EC] text-[#FF3D00]">
                <Link2 aria-hidden="true" size={24} />
              </span>
              <div>
                <h2 className="text-xl font-black text-neutral-950">상대방 연결</h2>
                <p className="text-sm font-semibold text-neutral-500">초대코드나 상대방 아이디를 입력하세요.</p>
              </div>
            </div>
            <form action={connectCouple} className="mt-5 space-y-4">
              <FormInput
                autoCapitalize="none"
                label="초대코드 또는 아이디"
                name="inviteCodeOrLoginId"
                placeholder="AB12CD 또는 minji"
                required
              />
              <PrimaryButton type="submit" className="w-full">
                연결 완료
              </PrimaryButton>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
