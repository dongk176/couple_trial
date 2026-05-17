import { ShieldAlert } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { hideCaseAsAdmin, blockReportedUserAsAdmin } from "@/lib/actions";
import { formatDate } from "@/lib/format";
import { getAdminData } from "@/lib/services";

const reportStatusLabel: Record<string, string> = {
  OPEN: "대기",
  ACTIONED: "처리 완료"
};

const caseStatusLabel: Record<string, string> = {
  OPEN: "투표 중",
  CLOSED: "판결 대기",
  VERDICT_DONE: "판결 완료",
  HIDDEN: "숨김"
};

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ secret?: string; error?: string }>;
}) {
  const params = await searchParams;
  const secret = params?.secret || "";
  const adminSecret = process.env.ADMIN_SECRET || process.env.COUPLE_COURT_ADMIN_SECRET || process.env.NEXTAUTH_SECRET;
  const locked = Boolean(adminSecret && secret !== adminSecret);

  if (locked) {
    return (
      <div className="min-h-screen py-8">
        <BackButton href="/" />
        <div className="mt-6 rounded-[18px] border border-[#E8E8ED] bg-white p-6 shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-[18px] bg-[#FFF2EC] text-[#FF3D00]">
            <ShieldAlert aria-hidden="true" size={24} />
          </div>
          <h1 className="mt-4 text-3xl font-black text-neutral-950">관리자 접근</h1>
          <p className="mt-2 text-sm leading-6 text-neutral-500">관리자 비밀값을 입력하면 신고 목록을 볼 수 있습니다.</p>
          {params?.error === "secret" ? (
            <p className="mt-4 rounded-[18px] bg-[#FFF2EC] px-4 py-3 text-sm font-bold text-[#F04411]">
              관리자 비밀값이 올바르지 않습니다.
            </p>
          ) : null}
          <form className="mt-5 space-y-4">
            <input
              name="secret"
              type="password"
              placeholder="관리자 비밀값"
              className="w-full rounded-[18px] border border-[#E8E8ED] px-4 py-3 text-base outline-none focus:border-[#FF3D00] focus:ring-4 focus:ring-[#FF3D00]/10"
            />
            <button className="min-h-12 w-full rounded-full bg-[#FF3D00] px-5 text-base font-black text-white">
              확인
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { reports, cases } = await getAdminData();

  return (
    <div className="py-8">
      <BackButton href="/home" />
      <h1 className="mt-6 text-3xl font-black text-neutral-950">관리자</h1>
      <p className="mt-2 text-base leading-6 text-neutral-500">신고된 사건을 확인하고 숨김 또는 차단 처리를 할 수 있습니다.</p>

      <section className="mt-7">
        <h2 className="mb-3 text-xl font-black text-neutral-950">신고 목록</h2>
        <div className="space-y-3">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-[18px] border border-[#E8E8ED] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#FF3D00]">{report.reason}</p>
                  <h3 className="mt-1 text-lg font-black text-neutral-950">
                    {report.case?.title || "유저 신고"}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">{report.detail || "상세 내용 없음"}</p>
                </div>
                <span className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-black text-neutral-600">
                  {reportStatusLabel[report.status] || report.status}
                </span>
              </div>
              <p className="mt-3 text-xs font-bold text-neutral-400">
                신고자 {report.reporter.nickname} · {formatDate(report.createdAt)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {report.case ? (
                  <form action={hideCaseAsAdmin}>
                    <input type="hidden" name="adminSecret" value={secret} />
                    <input type="hidden" name="caseId" value={report.case.id} />
                    <input type="hidden" name="reportId" value={report.id} />
                    <button className="min-h-11 w-full rounded-full bg-neutral-950 px-3 text-sm font-black text-white">
                      사건 숨김
                    </button>
                  </form>
                ) : null}
                <form action={blockReportedUserAsAdmin}>
                  <input type="hidden" name="adminSecret" value={secret} />
                  <input type="hidden" name="reportId" value={report.id} />
                  <button className="min-h-11 w-full rounded-full border border-[#E8E8ED] bg-white px-3 text-sm font-black text-neutral-800">
                    유저 차단 처리
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-black text-neutral-950">숨김 처리된 사건</h2>
        <div className="space-y-3">
          {cases.map((caseItem) => (
            <div key={caseItem.id} className="rounded-[18px] border border-[#E8E8ED] bg-white p-4 shadow-sm">
              <p className="text-lg font-black text-neutral-950">{caseItem.title}</p>
              <p className="mt-1 text-sm font-bold text-neutral-500">{caseStatusLabel[caseItem.status] || caseItem.status}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
