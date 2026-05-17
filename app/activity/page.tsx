import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, Gavel, Hourglass, Info, Scale } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { requireUser } from "@/lib/auth";
import { parseCaseImages } from "@/lib/case-images";
import { formatAverageSentence } from "@/lib/format";
import { getActivity } from "@/lib/services";

const juryLevels = [
  { minVotes: 0, level: 1, label: "새싹 배심원" },
  { minVotes: 5, level: 2, label: "견습 배심원" },
  { minVotes: 20, level: 3, label: "정의로운 배심원" },
  { minVotes: 50, level: 4, label: "수석 배심원" },
  { minVotes: 100, level: 5, label: "전설의 배심원" }
] as const;

function getJuryLevel(totalVotes: number) {
  return [...juryLevels].reverse().find((level) => totalVotes >= level.minVotes) || juryLevels[0];
}

function verdictTone(verdict: string) {
  if (verdict.includes("원고")) return "text-[#FF3D00]";
  if (verdict.includes("피고")) return "text-[#2563EB]";
  return "text-neutral-600";
}

function relativeTime(date: Date) {
  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / (1000 * 60)));
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${Math.floor(diffHours / 24)}일 전`;
}

function tendencyLabel(votes: Array<{ verdict: string }>) {
  if (!votes.length) return "판결 준비 중";

  const counts = votes.reduce<Record<string, number>>((acc, vote) => {
    acc[vote.verdict] = (acc[vote.verdict] || 0) + 1;
    return acc;
  }, {});
  const [topVerdict] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  if (topVerdict === "쌍방과실") return "쌍방과실 전문가";
  if (topVerdict === "화해 권고") return "화해 권고형";
  if (topVerdict === "무죄") return "신중한 무죄파";
  if (topVerdict === "피고 승") return "반론 경청형";
  return "원고 공감형";
}

function ActivityCaseImage({ image, title }: { image?: string; title: string }) {
  return (
    <div className="relative h-[70px] w-[86px] shrink-0 overflow-hidden rounded-[14px] bg-[#FFF2EC]">
      {image ? (
        <Image src={image} alt={`${title} 사건 사진`} fill sizes="86px" className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#FF3D00]">
          <Scale aria-hidden="true" size={28} strokeWidth={2.4} />
        </div>
      )}
    </div>
  );
}

export default async function ActivityPage() {
  const user = await requireUser();
  const activity = await getActivity(user.id);
  const juryLevel = getJuryLevel(activity.stats.totalVotes);
  const tendency = tendencyLabel(activity.votes);
  const recentVotes = activity.votes.slice(0, 8);

  return (
    <div>
      <AppHeader title="내 활동" backHref="/me" />

      <section className="ios-card mt-4 px-5 pb-5 pt-4 text-center">
        <div className="mx-auto w-fit">
          <div className="relative">
            <Image
              src={user.avatar}
              alt={`${user.nickname} 프로필`}
              width={74}
              height={74}
              className="h-[74px] w-[74px] rounded-full border border-[#E8E8ED] object-cover shadow-[0_8px_18px_rgba(17,17,17,0.08)]"
            />
            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#FF3D00]" />
          </div>
        </div>

        <h1 className="mt-3 text-[25px] font-black leading-none text-neutral-950">{user.nickname}</h1>

        <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full border border-[#E8E8ED] bg-white px-3 py-1.5 shadow-sm">
          <Image
            src={`/ajury/ajury.${juryLevel.level}.png`}
            alt={`${juryLevel.label} 레벨 이미지`}
            width={38}
            height={38}
            className="h-[38px] w-[38px] object-contain"
          />
          <span className="text-sm font-bold text-[#4B5563]">{juryLevel.label}</span>
          <span className="text-base font-black text-[#FF3D00]">Lv. {juryLevel.level}</span>
        </div>

        <div className="mt-4 rounded-[16px] border border-[#E8E8ED] bg-white px-3 py-4">
          <div className="grid grid-cols-3 divide-x divide-[#E8E8ED]">
            <div className="px-2">
              <Gavel aria-hidden="true" className="mx-auto text-[#FF3D00]" size={25} strokeWidth={2.5} />
              <p className="mt-2 text-xs font-bold text-[#767986]">총 배심</p>
              <p className="mt-2 text-[28px] font-black leading-none text-[#FF3D00]">
                {activity.stats.totalVotes}
                <span className="ml-1 text-sm text-neutral-950">건</span>
              </p>
            </div>
            <div className="px-2">
              <Hourglass aria-hidden="true" className="mx-auto text-[#FF3D00]" size={25} strokeWidth={2.5} />
              <p className="mt-2 text-xs font-bold text-[#767986]">평균 형량</p>
              <p className="mt-2 text-[22px] font-black leading-none text-[#FF3D00]">
                {formatAverageSentence(activity.stats.averageMonths)}
              </p>
            </div>
            <div className="px-2">
              <Scale aria-hidden="true" className="mx-auto text-[#FF3D00]" size={25} strokeWidth={2.5} />
              <p className="mt-2 text-xs font-bold text-[#767986]">판결 성향</p>
              <p className="mt-2 inline-flex items-center gap-1 text-[14px] font-black leading-5 text-neutral-950">
                {tendency}
                <Info aria-hidden="true" size={14} className="text-[#767986]" />
              </p>
            </div>
          </div>
          <div className="mt-4 rounded-[10px] bg-[#FFF4EE] px-3 py-2 text-xs font-bold text-[#4B5563]">
            <span className="mr-1 text-[#FF3D00]">♥</span>
            지금까지 따뜻하고 공정한 판단을 보여주셨어요!
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] font-black text-neutral-950">최근 참여 기록</h2>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-[#767986]">
            전체 보기 <ChevronRight aria-hidden="true" size={16} />
          </span>
        </div>

        <div className="space-y-1.5">
          {recentVotes.map((vote) => {
            const image = parseCaseImages(vote.case.caseImages)[0];
            const sentence = vote.case.verdict?.sentenceLabel || vote.sentenceLabel;
            return (
              <Link
                key={vote.id}
                href={`/cases/${vote.caseId}`}
                className="flex min-h-[86px] items-center gap-2 rounded-[16px] border border-[#ECECF1] bg-white p-1.5 pr-2 shadow-[0_6px_18px_rgba(17,17,17,0.05)]"
              >
                <ActivityCaseImage image={image} title={vote.case.title} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold leading-4 text-[#FF3D00]">{vote.case.category}</p>
                  <h3 className="mt-1 line-clamp-1 text-[15px] font-extrabold leading-[1.35] text-neutral-950">
                    {vote.case.title}
                  </h3>
                  <div className="mt-1 flex min-w-0 items-center gap-2 whitespace-nowrap text-[12px] font-bold leading-4">
                    <span className={verdictTone(vote.verdict)}>⚖ {vote.verdict}</span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">{sentence}</span>
                  </div>
                </div>
                <div className="flex h-full shrink-0 flex-col items-end justify-center gap-2 text-[#767986]">
                  <ChevronRight aria-hidden="true" size={18} />
                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] font-bold">
                    <Clock aria-hidden="true" size={13} />
                    {relativeTime(vote.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
