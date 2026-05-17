import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Sparkles, Users } from "lucide-react";
import { PrimaryButton } from "@/components/PrimaryButton";
import { reflectVerdictToProfile } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { percent } from "@/lib/format";
import { getVerdictDetail } from "@/lib/services";

export default async function VerdictPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireUser();
  const { id } = await params;
  const paramsValue = await searchParams;
  const detail = await getVerdictDetail(id);
  if (!detail) notFound();

  const { caseItem, verdict, voteSummary, reductionMissions } = detail;
  const verdictEntries = Object.entries(voteSummary.verdictCounts).sort((a, b) => b[1] - a[1]);
  const sentenceEntries = Object.entries(voteSummary.sentenceCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className="py-4">
      <div className="grid min-h-10 grid-cols-[36px_1fr_36px] items-center">
        <Link
          href={`/cases/${caseItem.id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-950"
          aria-label="뒤로가기"
        >
          <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.6} />
        </Link>
        <h1 className="text-center text-[18px] font-black text-neutral-950">판결 결과</h1>
        <span />
      </div>

      <section className="ios-card mt-4 p-4">
        <p className="text-xs font-black text-[#FF3D00]">사건</p>
        <h2 className="mt-2 text-[22px] font-black leading-[1.22] text-neutral-950">{caseItem.title}</h2>
        <div className="mt-5 grid grid-cols-2 divide-x divide-[#E8E8ED]">
          <div className="px-2 text-center">
            <p className="text-xs font-bold text-[#767986]">최종 판결</p>
            <p className="mt-2 text-[26px] font-black leading-none text-[#FF3D00]">{verdict.finalVerdict}</p>
          </div>
          <div className="px-2 text-center">
            <p className="text-xs font-bold text-[#767986]">최종 형량</p>
            <p className="mt-2 text-[21px] font-black leading-tight text-neutral-950">{verdict.sentenceLabel}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-center gap-1.5 rounded-[12px] bg-[#FFF2EC] px-3 py-2 text-xs font-bold text-neutral-950">
          <Users aria-hidden="true" className="text-[#FF3D00]" size={15} />
          배심원 {voteSummary.total}명의 투표로 판결됐습니다.
        </div>
      </section>

      {paramsValue?.error === "notready" ? (
        <div className="mt-4 rounded-[14px] border border-[#FFD6C8] bg-[#FFF2EC] px-3 py-2 text-xs font-bold text-[#F04411]">
          아직 판결을 생성할 수 없습니다.
        </div>
      ) : null}

      <section className="ios-card mt-4 p-4">
        <h2 className="text-[18px] font-black text-neutral-950">배심원 통계</h2>
        <div className="mt-3 space-y-2.5">
          {verdictEntries.map(([label, count]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs font-black text-neutral-700">
                <span>{label}</span>
                <span>{count}표</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-neutral-100">
                <div className="brand-gradient h-full rounded-full" style={{ width: `${percent(count, voteSummary.total)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-[12px] bg-neutral-50 p-3">
          <p className="text-xs font-black text-neutral-950">형량 최다 선택</p>
          <p className="mt-1.5 text-xs leading-5 text-neutral-600">
            {sentenceEntries[0]?.[0] || "집행유예"}가 {sentenceEntries[0]?.[1] || 0}표로 가장 많았습니다.
          </p>
        </div>
      </section>

      <section className="ios-card mt-4 p-4">
        <div className="flex items-center gap-1.5">
          <Sparkles aria-hidden="true" className="text-[#FF3D00]" size={17} />
          <h2 className="text-[18px] font-black text-neutral-950">AI 판결문</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-neutral-700">{verdict.aiVerdictText}</p>
      </section>

      <section className="mt-4">
        <h2 className="text-[18px] font-black text-neutral-950">감형 미션</h2>
        <p className="mt-1 text-xs font-semibold text-[#767986]">미션을 완료하면 형량이 감형됩니다.</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {reductionMissions.map((mission) => (
            <div
              key={mission.title}
              className="ios-card flex min-h-[104px] flex-col items-center justify-center p-2 text-center"
            >
              <div>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF2EC] text-[#FF3D00]">
                  <BadgeCheck aria-hidden="true" size={17} />
                </span>
                <p className="mt-2 text-xs font-black leading-4 text-neutral-950">{mission.title}</p>
              </div>
              <p className="mt-1.5 text-base font-black text-[#FF3D00]">{mission.reduction}</p>
            </div>
          ))}
        </div>
      </section>

      <form action={reflectVerdictToProfile} className="mt-5">
        <input type="hidden" name="caseId" value={caseItem.id} />
        <PrimaryButton type="submit" className="w-full !min-h-11 !rounded-[12px] !py-2.5 !text-sm" disabled={verdict.reflectedToProfile}>
          {verdict.reflectedToProfile ? "이미 프로필에 반영됨" : "프로필에 반영"}
        </PrimaryButton>
      </form>
    </div>
  );
}
