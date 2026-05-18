import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { LogoMark } from "@/components/LogoMark";

export function AppHeader({
  title = APP_NAME,
  backHref
}: {
  avatar?: string;
  nickname?: string;
  title?: string;
  backHref?: string;
}) {
  return (
    <>
      <header className="app-fixed-header fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-[430px] bg-white/95 px-4 pb-2 pt-[calc(12px+env(safe-area-inset-top))] backdrop-blur-xl sm:px-5">
        <div className="flex min-h-10 items-center justify-between">
        {backHref ? (
          <div className="grid min-h-10 flex-1 grid-cols-[32px_1fr_32px] items-center gap-1.5">
            <Link
              href={backHref}
              prefetch={false}
              aria-label="뒤로가기"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-950"
            >
              <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.6} />
            </Link>
            <span className="text-center text-[18px] font-black leading-6 text-neutral-950">{title}</span>
            <span />
          </div>
        ) : (
          <div className="flex min-h-10 w-full items-center gap-2">
            <Link href="/home" prefetch={false} className="flex shrink-0 items-center gap-1.5">
              <LogoMark size="sm" />
              <span className="text-[21px] font-black leading-6 text-neutral-950">{title}</span>
            </Link>
            <label className="flex min-h-9 flex-1 items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 text-[#767986]">
              <Search aria-hidden="true" size={15} strokeWidth={2.3} />
              <input
                type="search"
                aria-label="사건 검색"
                placeholder="사건 검색"
                className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-neutral-950 outline-none placeholder:text-[#9A9CAA]"
              />
            </label>
          </div>
        )}
        </div>
      </header>
      <div aria-hidden="true" className="h-[calc(60px+env(safe-area-inset-top))]" />
    </>
  );
}
