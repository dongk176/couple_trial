import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MessageSquareReply, ShieldAlert, UsersRound } from "lucide-react";
import { CaseComments } from "@/components/CaseComments";
import { JuryVoteForm } from "@/components/JuryVoteForm";
import { ReportModal } from "@/components/ReportModal";
import { UserAvatar } from "@/components/UserAvatar";
import { ViewCountIcon } from "@/components/ViewCountIcon";
import { blockUser } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { parseCaseImages } from "@/lib/case-images";
import { NO_SENTENCE_VERDICTS } from "@/lib/constants";
import { deadlineLabel } from "@/lib/format";
import { getCaseDetail } from "@/lib/services";

const errors: Record<string, string> = {
  vote: "판결을 선택하고, 필요한 경우 형량도 선택하세요.",
  closed: "투표가 종료된 사건입니다.",
  full: "배심원 100명이 모두 참여했습니다.",
  already: "이미 배심을 완료한 사건입니다.",
  comment: "배심원 한 마디는 40자 이하로 적어주세요.",
  commentRequired: "댓글 내용을 입력하세요.",
  caseComment: "댓글은 160자 이하로 적어주세요.",
  reply: "답글을 달 댓글을 확인하세요.",
  report: "신고 사유를 선택하세요."
};

export default async function CaseDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; voted?: string; reported?: string; responded?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const paramsValue = await searchParams;
  const caseItem = await getCaseDetail(id, user.id);
  if (!caseItem) notFound();

  const error = paramsValue?.error ? errors[paramsValue.error] : null;
  const reported = paramsValue?.reported === "1";
  const voted = paramsValue?.voted === "1";
  const responded = paramsValue?.responded === "1";
  const pendingDefendant = caseItem.status === "PENDING_DEFENDANT";
  const isDefendant = caseItem.defendantId === user.id;
  const targetUser =
    caseItem.plaintiff.id === user.id ? caseItem.defendant : caseItem.plaintiff;
  const caseImages = parseCaseImages(caseItem.caseImages);

  return (
    <div className="py-4">
      <div className="grid min-h-10 grid-cols-[36px_1fr_36px] items-center gap-1.5">
        <Link
          href="/home"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-950"
          aria-label="뒤로가기"
        >
          <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.6} />
        </Link>
        <h1 className="text-center text-[18px] font-black text-neutral-950">사건 상세</h1>
        <span />
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5">
          <ReportModal caseId={caseItem.id} targetUserId={targetUser?.id} />
          {targetUser ? (
            <form action={blockUser}>
              <input type="hidden" name="caseId" value={caseItem.id} />
              <input type="hidden" name="blockedUserId" value={targetUser.id} />
              <button className="inline-flex min-h-8 items-center justify-center rounded-full border border-[#E8E8ED] bg-white px-3 text-xs font-black text-neutral-700 shadow-sm">
                차단
              </button>
            </form>
          ) : null}
      </div>

      <section className="ios-card mt-7 p-5">
        <span className="inline-flex rounded-full bg-[#FFF2EC] px-3 py-1.5 text-sm font-black text-[#F04411]">
          {caseItem.category}
        </span>
        <h2 className="mt-5 text-[34px] font-black leading-[1.2] text-neutral-950">{caseItem.title}</h2>
        <div className="mt-5 flex flex-wrap gap-3 text-base font-bold text-[#666A75]">
          <span className="inline-flex items-center gap-1.5">
            <UsersRound aria-hidden="true" size={16} />
            <b className="text-[#FF3D00]">{caseItem._count.votes}</b>/{caseItem.maxJurors} 명 참여 중
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" size={16} />
            {deadlineLabel(caseItem.voteDeadlineAt)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ViewCountIcon size={16} />
            조회수 {caseItem.viewCount.toLocaleString("ko-KR")}
          </span>
        </div>
        {caseImages.length ? (
          <div className="mt-5 space-y-2">
            <div className="relative h-[230px] overflow-hidden rounded-[18px] bg-[#FFF2EC]">
              <Image
                src={caseImages[0]}
                alt={`${caseItem.title} 사건 사진 1`}
                fill
                sizes="(max-width: 430px) 100vw, 430px"
                className="object-cover"
              />
            </div>
            {caseImages.length > 1 ? (
              <div className="grid grid-cols-2 gap-2">
                {caseImages.slice(1).map((image, index) => (
                  <div key={image} className="relative h-[118px] overflow-hidden rounded-[16px] bg-[#FFF2EC]">
                    <Image
                      src={image}
                      alt={`${caseItem.title} 사건 사진 ${index + 2}`}
                      fill
                      sizes="(max-width: 430px) 50vw, 210px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      {error || reported || voted || responded ? (
        <div className="mt-5 rounded-[16px] border border-[#FFD6C8] bg-[#FFF2EC] px-4 py-3 text-sm font-bold text-[#F04411]">
          {error ||
            (responded
              ? "피고 답변이 제출되어 사건이 공개됐습니다."
              : reported
                ? "신고가 접수됐습니다."
                : "배심 투표가 저장됐습니다.")}
        </div>
      ) : null}

      {pendingDefendant ? (
        <section className="mt-6 rounded-[18px] border border-[#FFD6C8] bg-[#FFF2EC] p-5 text-[#D93400] shadow-[0_12px_34px_rgba(0,0,0,0.05)]">
          <p className="text-sm font-black">피고 답변 대기 중</p>
          <p className="mt-2 text-base font-bold leading-7">
            피고 답변이 제출되면 AI 요약이 생성되고 사건이 공개 재판에 올라갑니다.
          </p>
          {isDefendant ? (
            <Link
              href={`/cases/${caseItem.id}/respond`}
              className="brand-gradient mt-4 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-[18px] px-5 text-lg font-black text-white"
            >
              <MessageSquareReply aria-hidden="true" size={19} />
              피고 답변 작성
            </Link>
          ) : null}
        </section>
      ) : (
        <section className="ios-card mt-6 p-5">
          <p className="text-sm font-black text-[#FF3D00]">AI 요약</p>
          <p className="mt-2 text-base leading-7 text-neutral-700">{caseItem.aiSummary}</p>
          <div className="mt-4 space-y-2">
            {caseItem.aiIssuesList.map((issue) => (
              <div key={issue} className="rounded-[18px] bg-neutral-50 px-4 py-3 text-sm font-bold text-neutral-700">
                {issue}
              </div>
            ))}
          </div>
          {(caseItem.aiWarningData.hasPersonalInfo || caseItem.aiWarningData.hasAbuse) && (
            <div className="mt-4 flex items-start gap-2 rounded-[18px] bg-[#FFF2EC] px-4 py-3 text-sm font-bold text-[#D93400]">
              <ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
              {caseItem.aiWarningData.message}
            </div>
          )}
        </section>
      )}

      <section className="mt-5 grid gap-4">
        <article className="ios-card p-5">
          <div className="flex items-center gap-3">
            <UserAvatar src={caseItem.plaintiff.avatar} alt={`${caseItem.plaintiff.nickname} 프로필`} />
            <div>
              <p className="text-[22px] font-black text-[#FF3D00]">원고 주장</p>
              <p className="mt-1 text-sm font-bold text-[#767986]">{caseItem.plaintiff.nickname}</p>
            </div>
          </div>
          <p className="mt-4 text-base leading-7 text-neutral-700">{caseItem.plaintiffStatement}</p>
        </article>

        <article className="ios-card p-5">
          <div className="flex items-center gap-3">
            {caseItem.defendant ? (
              <UserAvatar src={caseItem.defendant.avatar} alt={`${caseItem.defendant.nickname} 프로필`} />
            ) : null}
            <div>
              <p className="text-[22px] font-black text-[#4E7AF0]">피고 답변</p>
              <p className="mt-1 text-sm font-bold text-[#767986]">{caseItem.defendant?.nickname || "익명 피고"}</p>
            </div>
          </div>
          {caseItem.defendantStatement && caseItem.defendantResponseSource === "PLAINTIFF" ? (
            <span className="mt-4 inline-flex rounded-full bg-[#FFF2EC] px-3 py-1.5 text-xs font-black text-[#FF3D00]">
              원고가 직접 작성한 답변
            </span>
          ) : null}
          {caseItem.defendantStatement ? (
            <p className="mt-4 text-base leading-7 text-neutral-700">{caseItem.defendantStatement}</p>
          ) : (
            <div className="mt-4 rounded-[16px] bg-neutral-50 px-4 py-4 text-sm font-bold leading-6 text-neutral-500">
              피고 답변을 기다리고 있습니다.
            </div>
          )}
        </article>
      </section>

      <section className="ios-card mt-7 p-5">
        <h2 className="text-[25px] font-black text-neutral-950">당신의 판결</h2>
        {pendingDefendant ? (
          <div className="mt-4 rounded-[18px] bg-white p-5 text-center shadow-sm">
            <p className="text-lg font-black text-neutral-950">아직 재판 전입니다</p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              피고 답변이 도착하면 공개 재판과 배심 투표가 시작됩니다.
            </p>
            {isDefendant ? (
              <Link
                href={`/cases/${caseItem.id}/respond`}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF3D00] px-5 text-base font-black text-white"
              >
                답변 작성하기
              </Link>
            ) : null}
          </div>
        ) : caseItem.myVote ? (
          <div className="mt-4 rounded-[18px] bg-white p-5 text-center shadow-sm">
            <p className="text-lg font-black text-neutral-950">이미 배심 완료</p>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              선택한 판결은 {caseItem.myVote.verdict}
              {NO_SENTENCE_VERDICTS.includes(caseItem.myVote.verdict)
                ? "입니다."
                : `, 형량은 ${caseItem.myVote.sentenceLabel}입니다.`}
            </p>
            {caseItem.myVote.comment ? (
              <p className="mt-4 rounded-[18px] bg-neutral-50 px-4 py-3 text-sm font-bold leading-6 text-neutral-700">
                “{caseItem.myVote.comment}”
              </p>
            ) : null}
          </div>
        ) : caseItem.isVoteClosed ? (
          <div className="mt-4 rounded-[18px] bg-white p-5 text-center shadow-sm">
            <p className="text-lg font-black text-neutral-950">투표가 종료됐습니다</p>
            <Link
              href={`/cases/${caseItem.id}/verdict`}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#FF3D00] px-5 text-base font-black text-white"
            >
              최종 판결 보기
            </Link>
          </div>
        ) : (
          <JuryVoteForm caseId={caseItem.id} />
        )}
      </section>

      <CaseComments caseId={caseItem.id} comments={caseItem.comments} commentCount={caseItem._count.comments} />
    </div>
  );
}
