import Link from "next/link";
import { Award, Gavel } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { CaseCard } from "@/components/CaseCard";
import { CaseRequestOverlay } from "@/components/CaseRequestOverlay";
import { EmptyState } from "@/components/EmptyState";
import { primaryButtonClass } from "@/components/PrimaryButton";
import { requireUser } from "@/lib/auth";
import { formatAverageSentence } from "@/lib/format";
import { getJuryStats, listPublicCases } from "@/lib/services";

function TotalVoteIcon() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M5 5H19C20.1 5 21 5.9 21 7V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V7C3 5.9 3.9 5 5 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 13L10.2 15.2L15.5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 18H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function AverageSentenceIcon() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 21C16.4 21 20 17.4 20 13C20 8.6 16.4 5 12 5C7.6 5 4 8.6 4 13C4 17.4 7.6 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 13L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 3H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 6L19.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 13H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 13H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ caseRequested?: string; caseTitle?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const [cases, stats] = await Promise.all([listPublicCases(user.id), getJuryStats(user.id)]);
  const openCases = cases.filter((caseItem) => caseItem.status === "OPEN");
  const todayCase = openCases[0] || cases[0];
  const popularCases = [...cases].sort((a, b) => b._count.votes - a._count.votes).slice(0, 5);

  return (
    <div>
      {params?.caseRequested === "1" ? <CaseRequestOverlay title={params.caseTitle || "새 사건"} /> : null}
      <AppHeader avatar={user.avatar} nickname={user.nickname} />

      <section className="pt-4">
        <h1 className="text-[24px] font-black leading-tight text-neutral-950">내 활동</h1>
        <p className="mt-1.5 text-sm font-semibold leading-5 text-[#767986]">
          {user.nickname}님의 배심 경력과 공개 사건을 확인해보세요.
        </p>
      </section>

      <section className="ios-card mt-4 px-4 py-3.5">
        <div className="grid grid-cols-3 divide-x divide-[#E8E8ED]">
          <div className="flex min-w-0 items-center gap-2 pr-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF2EC] text-[#FF3D00]">
              <TotalVoteIcon />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#767986]">총 배심</p>
              <p className="mt-1 whitespace-nowrap text-[19px] font-black leading-none text-[#FF3D00]">
                {stats.totalVotes}
                <span className="ml-0.5 text-xs text-neutral-950">회</span>
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 px-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF2EC] text-[#FF3D00]">
              <AverageSentenceIcon />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#767986]">평균</p>
              <p className="mt-1 truncate text-[15px] font-black leading-none text-[#FF3D00]">
                {formatAverageSentence(stats.averageMonths)}
              </p>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-2 pl-3">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF2EC] text-[#FF3D00]">
              <Award aria-hidden="true" size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#767986]">배지</p>
              <p className="mt-1 whitespace-nowrap text-[19px] font-black leading-none text-[#FF3D00]">
                {stats.badges.length}
                <span className="ml-0.5 text-xs text-neutral-950">개</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-black text-neutral-950">오늘의 공개 재판</h2>
          <Link href="/cases" prefetch={false} className="text-xs font-black text-[#FF3D00]">
            전체보기
          </Link>
        </div>
        {todayCase ? (
          <CaseCard caseItem={todayCase} variant="compact" />
        ) : (
          <EmptyState
            title="아직 공개 사건이 없어요"
            description="커플 연결 후 첫 사건을 공개로 등록해보세요."
            action={
              <Link href="/cases/new" className={primaryButtonClass}>
                사건 등록
              </Link>
            }
          />
        )}
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-[18px] leading-none">
              🔥
            </span>
            <h2 className="text-[18px] font-black text-neutral-950">지금 인기 사건</h2>
          </div>
          <Link href="/cases" prefetch={false} className="text-xs font-black text-[#FF3D00]">
            전체보기
          </Link>
        </div>
        <div className="space-y-1.5">
          {popularCases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseItem={caseItem} variant="compact" />
          ))}
        </div>
      </section>

      <div className="mt-8 rounded-[18px] bg-neutral-950 p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-neutral-950">
            <Gavel aria-hidden="true" size={23} />
          </span>
          <div>
            <p className="text-lg font-black">모든 사건은 공개입니다</p>
            <p className="mt-1 text-sm leading-5 text-white/68">차단한 유저와 운영자 숨김 사건은 피드에서 제외됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
