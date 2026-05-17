import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquareReply } from "lucide-react";
import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { UserAvatar } from "@/components/UserAvatar";
import { submitDefendantResponse } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

const errors: Record<string, string> = {
  required: "피고 답변을 입력하세요.",
  forbidden: "피고만 답변을 작성할 수 있습니다.",
  closed: "이미 답변이 제출된 사건입니다."
};

export default async function DefendantResponsePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const paramsValue = await searchParams;
  const error = paramsValue?.error ? errors[paramsValue.error] : null;

  const caseItem = await getPrisma().case.findUnique({
    where: { id },
    include: {
      plaintiff: { select: { nickname: true, avatar: true } },
      defendant: { select: { id: true, nickname: true, avatar: true } }
    }
  });

  if (!caseItem || caseItem.adminHidden || caseItem.status === "HIDDEN") notFound();
  if (caseItem.defendantId !== user.id) notFound();

  const alreadySubmitted = caseItem.status !== "PENDING_DEFENDANT";

  return (
    <div className="py-4">
      <div className="grid min-h-10 grid-cols-[36px_1fr_36px] items-center gap-1.5">
        <Link
          href={`/cases/${caseItem.id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-950"
          aria-label="뒤로가기"
        >
          <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.6} />
        </Link>
        <h1 className="text-center text-[18px] font-black text-neutral-950">피고 답변</h1>
        <span />
      </div>

      <section className="pt-5">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FFF2EC] text-[#FF3D00]">
          <MessageSquareReply aria-hidden="true" size={24} />
        </span>
        <h1 className="mt-4 text-3xl font-black leading-9 text-neutral-950">답변 요청이 도착했어요</h1>
        <p className="mt-2 text-base leading-6 text-neutral-500">내 입장을 직접 적으면 사건이 공개 재판에 올라갑니다.</p>
      </section>

      {error ? (
        <div className="mt-5 rounded-[18px] border border-[#FFD6C8] bg-[#FFF2EC] px-4 py-3 text-sm font-bold text-[#F04411]">
          {error}
        </div>
      ) : null}

      <section className="mt-6 rounded-[18px] border border-[#E8E8ED] bg-white p-5 shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-3">
          <UserAvatar src={caseItem.plaintiff.avatar} alt={`${caseItem.plaintiff.nickname} 프로필`} />
          <div>
            <p className="text-sm font-bold text-neutral-500">원고 주장</p>
            <p className="text-lg font-black text-neutral-950">{caseItem.title}</p>
          </div>
        </div>
        <p className="mt-4 text-base leading-7 text-neutral-700">{caseItem.plaintiffStatement}</p>
      </section>

      {alreadySubmitted ? (
        <section className="mt-5 rounded-[18px] border border-[#E8E8ED] bg-white p-5 text-center shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
          <p className="text-lg font-black text-neutral-950">이미 답변이 제출됐습니다</p>
          <Link
            href={`/cases/${caseItem.id}`}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF3D00] px-5 text-base font-black text-white"
          >
            사건 보러가기
          </Link>
        </section>
      ) : (
        <form action={submitDefendantResponse} className="mt-5 space-y-5">
          <input type="hidden" name="caseId" value={caseItem.id} />
          <FormInput
            label="피고 답변"
            name="defendantStatement"
            textarea
            placeholder="내 입장에서 상황과 이유를 직접 적어주세요."
            required
          />
          <PrimaryButton type="submit" className="w-full">
            답변 제출하고 재판 열기
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
