import Link from "next/link";
import { Building2, ChevronRight, FileText, Headphones, LogOut, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BadgeIcon } from "@/components/BadgeIcon";
import { EmptyState } from "@/components/EmptyState";
import { ProfileEditor } from "@/components/ProfileEditor";
import { logout } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatAverageSentence, formatDate, formatSentence } from "@/lib/format";
import { getProfile } from "@/lib/services";

export default async function MePage({
  searchParams
}: {
  searchParams?: Promise<{ reflected?: string; profile?: string; profileError?: string }>;
}) {
  const sessionUser = await requireUser();
  const params = await searchParams;
  const { user, stats, records } = await getProfile(sessionUser.id);
  if (!user) return null;

  const activeRecord = records.find((record) => record.status === "ACTIVE");
  const juryTitle = stats.totalVotes >= 20 ? "수석 배심원" : stats.totalVotes >= 5 ? "정식 배심원" : "예비 배심원";
  const totalSentence = records.reduce((sum, record) => sum + (record.sentenceMonths >= 9999 ? 120 : record.sentenceMonths), 0);
  const profileErrorMessage =
    params?.profileError === "nickname"
      ? "이름은 1~20자로 입력해주세요."
      : params?.profileError === "avatar"
        ? "프로필 사진은 JPG, PNG, WEBP, GIF 형식과 4MB 이하만 가능해요."
        : params?.profileError === "upload"
          ? "프로필 사진 저장소 설정을 확인해주세요."
          : null;

  return (
    <div>
      <AppHeader title="마이페이지" backHref="/home" />

      {params?.reflected ? (
        <div className="mt-3 rounded-[14px] border border-[#FFD6C8] bg-[#FFF2EC] px-3 py-2 text-xs font-bold text-[#F04411]">
          판결 결과가 프로필에 반영됐습니다.
        </div>
      ) : null}
      {params?.profile === "updated" ? (
        <div className="mt-3 rounded-[14px] border border-[#FFD6C8] bg-[#FFF2EC] px-3 py-2 text-xs font-bold text-[#F04411]">
          프로필이 수정됐습니다.
        </div>
      ) : null}
      {profileErrorMessage ? (
        <div className="mt-3 rounded-[14px] border border-[#FFD6C8] bg-[#FFF2EC] px-3 py-2 text-xs font-bold text-[#F04411]">
          {profileErrorMessage}
        </div>
      ) : null}

      <ProfileEditor user={{ nickname: user.nickname, avatar: user.avatar }} juryTitle={juryTitle} />

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

      <section className="mt-5 space-y-2">
        <h2 className="text-[15px] font-black text-neutral-950">앱 정보</h2>
        <div className="ios-card overflow-hidden p-1">
          <Link href="/privacy" className="flex min-h-11 items-center justify-between rounded-[14px] px-3 text-sm font-black text-neutral-900">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck aria-hidden="true" size={16} className="text-[#FF3D00]" />
              개인정보 처리방침
            </span>
            <ChevronRight aria-hidden="true" size={16} className="text-[#9A9CAA]" />
          </Link>
          <Link href="/terms" className="flex min-h-11 items-center justify-between rounded-[14px] px-3 text-sm font-black text-neutral-900">
            <span className="inline-flex items-center gap-2">
              <FileText aria-hidden="true" size={16} className="text-[#FF3D00]" />
              서비스 이용약관
            </span>
            <ChevronRight aria-hidden="true" size={16} className="text-[#9A9CAA]" />
          </Link>
          <Link href="/support" className="flex min-h-11 items-center justify-between rounded-[14px] px-3 text-sm font-black text-neutral-900">
            <span className="inline-flex items-center gap-2">
              <Headphones aria-hidden="true" size={16} className="text-[#FF3D00]" />
              고객지원
            </span>
            <ChevronRight aria-hidden="true" size={16} className="text-[#9A9CAA]" />
          </Link>
        </div>
      </section>

      <section className="mt-3 rounded-[16px] border border-[#ECECF1] bg-white p-4 text-[11px] font-semibold leading-5 text-[#666A75] shadow-sm">
        <h2 className="flex items-center gap-1.5 text-[13px] font-black text-neutral-950">
          <Building2 aria-hidden="true" size={15} className="text-[#FF3D00]" />
          사업자 정보
        </h2>
        <dl className="mt-2 space-y-1">
          <div className="flex gap-2"><dt className="w-20 shrink-0 text-[#8A8D98]">상호/대표</dt><dd>아티룸 / 김동민</dd></div>
          <div className="flex gap-2"><dt className="w-20 shrink-0 text-[#8A8D98]">사업자번호</dt><dd>638-04-03590</dd></div>
          <div className="flex gap-2"><dt className="w-20 shrink-0 text-[#8A8D98]">통신판매업</dt><dd>2025-서울마포-2971</dd></div>
          <div className="flex gap-2"><dt className="w-20 shrink-0 text-[#8A8D98]">주소</dt><dd>서울특별시 마포구 성산로8길 40</dd></div>
          <div className="flex gap-2"><dt className="w-20 shrink-0 text-[#8A8D98]">문의</dt><dd>support@coupletrial.com</dd></div>
        </dl>
      </section>
    </div>
  );
}
