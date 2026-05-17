import Link from "next/link";
import { ChevronRight, LogOut } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BadgeIcon } from "@/components/BadgeIcon";
import { EmptyState } from "@/components/EmptyState";
import { UserAvatar } from "@/components/UserAvatar";
import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatAverageSentence, formatDate, formatSentence } from "@/lib/format";
import { getProfile } from "@/lib/services";

export default async function MePage({
  searchParams
}: {
  searchParams?: Promise<{ reflected?: string }>;
}) {
  const sessionUser = await requireUser();
  const params = await searchParams;
  const { user, stats, records } = await getProfile(sessionUser.id);
  if (!user) return null;

  const activeRecord = records.find((record) => record.status === "ACTIVE");
  const juryTitle = stats.totalVotes >= 20 ? "수석 배심원" : stats.totalVotes >= 5 ? "정식 배심원" : "예비 배심원";
  const totalSentence = records.reduce((sum, record) => sum + (record.sentenceMonths >= 9999 ? 120 : record.sentenceMonths), 0);

  return (
    <div>
      <AppHeader title="마이페이지" backHref="/home" />

      {params?.reflected ? (
        <div className="mt-3 rounded-[14px] border border-[#FFD6C8] bg-[#FFF2EC] px-3 py-2 text-xs font-bold text-[#F04411]">
          판결 결과가 프로필에 반영됐습니다.
        </div>
      ) : null}

      <section className="flex items-center gap-4 pt-5">
        <div className="relative w-fit">
          <UserAvatar src={user.avatar} alt={`${user.nickname} 프로필`} size="md" />
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#FF3D00]" />
        </div>
        <div>
          <h1 className="text-[25px] font-black leading-none text-neutral-950">{user.nickname}</h1>
          <p className="mt-2 text-sm font-semibold text-[#767986]">{juryTitle}</p>
        </div>
      </section>

      <section className="ios-card mt-5 grid grid-cols-3 divide-x divide-[#E8E8ED] p-3 text-center">
        <div>
          <p className="text-xs font-bold text-[#767986]">총 배심</p>
          <p className="mt-2 text-[24px] font-black leading-none text-[#FF3D00]">
            {stats.totalVotes}<span className="ml-1 text-xs text-neutral-950">회</span>
          </p>
        </div>
        <div>
          <p className="text-xs font-bold text-[#767986]">평균 형량</p>
          <p className="mt-2 text-[18px] font-black leading-none text-[#FF3D00]">{formatAverageSentence(stats.averageMonths)}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-[#767986]">누적 전과</p>
          <p className="mt-2 text-[24px] font-black leading-none text-neutral-950">
            {records.length}<span className="ml-1 text-xs">건</span>
          </p>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[18px] font-black text-neutral-950">보유 배지</h2>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-[#767986]">
            모두 보기 <ChevronRight size={14} />
          </span>
        </div>
        <div className="ios-card p-3">
          <div className="flex flex-wrap gap-2">
            {(stats.badges.length ? stats.badges : ["예비 배심원"]).map((badge) => (
              <BadgeIcon key={badge} label={badge} />
            ))}
          </div>
        </div>
      </section>

      <section className="ios-card mt-4 p-3">
        <p className="text-xs font-bold text-[#767986]">현재 징역 프로필</p>
        <h2 className="mt-1.5 text-[20px] font-black text-neutral-950">
          {activeRecord ? formatSentence(activeRecord.remainingMonths, activeRecord.sentenceLabel) : "집행유예"}
        </h2>
        <p className="mt-1.5 text-xs font-semibold leading-5 text-[#767986]">
          누적 형량은 {formatAverageSentence(totalSentence)}입니다. 감형 미션을 완료하면 기록을 줄일 수 있습니다.
        </p>
      </section>

      <section className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[18px] font-black text-neutral-950">최근 형량 기록</h2>
          <Link href="/activity" className="text-xs font-black text-[#FF3D00]">
            활동 보기
          </Link>
        </div>
        {records.length ? (
          <div className="space-y-2">
            {records.map((record) => (
              <article
                key={record.id}
                className="ios-card p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-neutral-950">{record.title}</h3>
                    <p className="mt-1 text-xs font-semibold text-neutral-500">{formatDate(record.createdAt)}</p>
                  </div>
                  <span className="rounded-full bg-[#FFF2EC] px-2.5 py-1 text-xs font-black text-[#F04411]">
                    {record.sentenceLabel}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="판결 기록이 없어요" description="최종 판결을 프로필에 반영하면 이곳에 기록됩니다." />
        )}
      </section>

      <form action={logout} className="mt-5">
        <button className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-full border border-[#E8E8ED] bg-white px-4 text-sm font-black text-neutral-800 shadow-sm">
          <LogOut aria-hidden="true" size={15} />
          로그아웃
        </button>
      </form>
    </div>
  );
}
