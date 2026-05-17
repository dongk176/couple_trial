import Link from "next/link";
import { CaseCard } from "@/components/CaseCard";
import { EmptyState } from "@/components/EmptyState";
import { AppHeader } from "@/components/AppHeader";
import { primaryButtonClass } from "@/components/PrimaryButton";
import { requireUser } from "@/lib/auth";
import { listPublicCases } from "@/lib/services";

export default async function CasesPage() {
  const user = await requireUser();
  const cases = await listPublicCases(user.id);
  const openCount = cases.filter((caseItem) => caseItem.status === "OPEN").length;

  return (
    <div>
      <AppHeader title="전체 재판" backHref="/home" />

      <section className="pt-3">
        <h1 className="text-[24px] font-black leading-[1.22] text-neutral-950">
          공개 재판을
          <br />
          한눈에 확인하세요
        </h1>
        <p className="mt-2 text-sm font-semibold leading-5 text-[#666A75]">지금 투표 가능한 사건수: {openCount}건</p>
      </section>

      <section className="mt-4 space-y-1.5">
        {cases.length ? (
          cases.map((caseItem) => <CaseCard key={caseItem.id} caseItem={caseItem} variant="compact" />)
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
    </div>
  );
}
