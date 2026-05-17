import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, Scale, Users } from "lucide-react";
import { ViewCountIcon } from "@/components/ViewCountIcon";
import { parseCaseImages } from "@/lib/case-images";
import { deadlineLabel } from "@/lib/format";

type CaseCardItem = {
  id: string;
  title: string;
  category: string;
  aiSummary: string;
  caseImages: string;
  voteDeadlineAt: Date;
  status: string;
  maxJurors: number;
  viewCount: number;
  verdict?: { finalVerdict: string } | null;
  _count: { votes: number };
};

type CaseCardVariant = "compact" | "featured" | "default";

const cardStyle = {
  compact: {
    wrapper:
      "rounded-[16px] border border-[#ECECF1] bg-white p-1.5 shadow-[0_6px_18px_rgba(17,17,17,0.05)] gap-2",
    image: "h-[88px] w-[88px] rounded-[15px]",
    category: "text-[12px] font-semibold leading-4 text-[#FF3D00]",
    title: "text-[15px] leading-[1.35] font-extrabold text-neutral-950",
    verdict: "text-[12px] leading-5 font-extrabold",
    meta: "text-[11px] font-bold leading-4 text-[#6B7280]"
  },
  featured: {
    wrapper:
      "rounded-[18px] border border-[#ECECF1] bg-white p-3 shadow-[0_10px_26px_rgba(17,17,17,0.06)] gap-3",
    image: "h-[116px] w-[116px] rounded-[16px]",
    category: "text-[14px] font-semibold leading-5 text-[#FF3D00]",
    title: "text-[22px] leading-[1.3] font-extrabold text-neutral-950",
    verdict: "text-[14px] leading-5 font-extrabold",
    meta: "text-[13px] font-bold leading-5 text-[#6B7280]",
    summary: "text-[13px] leading-[1.5] font-semibold text-[#6B7280]"
  },
  default: {
    wrapper:
      "rounded-[18px] border border-[#ECECF1] bg-white p-3 shadow-[0_10px_26px_rgba(17,17,17,0.06)] gap-3",
    image: "h-[96px] w-[96px] rounded-[15px]",
    category: "text-[13px] font-semibold leading-5 text-[#FF3D00]",
    title: "text-[18px] leading-[1.35] font-extrabold text-neutral-950",
    verdict: "text-[13px] leading-5 font-extrabold",
    meta: "text-[12px] font-bold leading-5 text-[#6B7280]",
    summary: "text-[13px] leading-[1.5] font-semibold text-[#6B7280]"
  }
} as const;

function CaseCoverImage({
  image,
  title,
  className,
  iconSize = 46
}: {
  image?: string;
  title: string;
  className: string;
  iconSize?: number;
}) {
  return (
    <div className={`soft-orange relative overflow-hidden border border-[#F1E8E3] ${className}`}>
      {image ? (
        <Image
          src={image}
          alt={`${title} 사건 사진`}
          fill
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[#FF3D00]">
          <Scale aria-hidden="true" size={iconSize} strokeWidth={2.4} />
        </div>
      )}
    </div>
  );
}

export function CaseCard({
  caseItem,
  variant = "compact"
}: {
  caseItem: CaseCardItem;
  variant?: CaseCardVariant;
}) {
  const voteCount = caseItem._count.votes;
  const closed = caseItem.status !== "OPEN";
  const images = parseCaseImages(caseItem.caseImages);
  const coverImage = images[0];
  const finalVerdict = caseItem.verdict?.finalVerdict || "판결 진행중";
  const hasFinalVerdict = Boolean(caseItem.verdict?.finalVerdict);

  if (variant === "featured") {
    const styles = cardStyle.featured;

    return (
      <Link
        href={closed ? `/cases/${caseItem.id}/verdict` : `/cases/${caseItem.id}`}
        prefetch={false}
        className={`${styles.wrapper} group relative flex items-stretch overflow-hidden transition active:scale-[0.99]`}
      >
        <CaseCoverImage image={coverImage} title={caseItem.title} className={`${styles.image} shrink-0 self-center`} iconSize={54} />
        <div className="grid min-w-0 flex-1 content-center gap-1.5 pr-9">
          <p className={`truncate ${styles.category}`}>{caseItem.category}</p>
          <h3 className={`line-clamp-1 ${styles.title}`}>{caseItem.title}</h3>
          <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
            <p
              className={[
                "min-w-0 truncate",
                styles.verdict,
                hasFinalVerdict ? "text-[#FF3D00]" : "text-[#767986]"
              ].join(" ")}
            >
              {finalVerdict}
            </p>
            <span className={`inline-flex shrink-0 items-center gap-1 ${styles.meta}`}>
              <Clock aria-hidden="true" size={14} />
              {deadlineLabel(caseItem.voteDeadlineAt)}
            </span>
          </div>
          <p className={`line-clamp-2 ${styles.summary}`}>{caseItem.aiSummary}</p>
          <div className={`flex min-w-0 items-center gap-3 whitespace-nowrap ${styles.meta}`}>
            <span className="inline-flex items-center gap-1">
              <Users aria-hidden="true" size={14} />
              <b className="text-[#FF3D00]">{voteCount}</b>/{caseItem.maxJurors}
            </span>
            <span className="inline-flex items-center gap-1">
              <ViewCountIcon size={14} />
              {caseItem.viewCount.toLocaleString("ko-KR")}
            </span>
          </div>
        </div>
        <span className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#767986] transition group-active:bg-[#F5F5F7]">
          <ChevronRight aria-hidden="true" size={21} />
        </span>
      </Link>
    );
  }

  if (variant === "default") {
    const styles = cardStyle.default;

    return (
      <Link
        href={closed ? `/cases/${caseItem.id}/verdict` : `/cases/${caseItem.id}`}
        prefetch={false}
        className={`${styles.wrapper} group relative flex items-stretch overflow-hidden transition active:scale-[0.99]`}
      >
        <CaseCoverImage image={coverImage} title={caseItem.title} className={`${styles.image} shrink-0 self-center`} />
        <div className="grid min-w-0 flex-1 content-center gap-1 pr-8">
          <p className={`truncate ${styles.category}`}>{caseItem.category}</p>
          <h3 className={`line-clamp-1 ${styles.title}`}>{caseItem.title}</h3>
          <div className="flex min-w-0 items-center gap-2 whitespace-nowrap">
            <p
              className={[
                "min-w-0 truncate",
                styles.verdict,
                hasFinalVerdict ? "text-[#FF3D00]" : "text-[#767986]"
              ].join(" ")}
            >
              {finalVerdict}
            </p>
            <span className={`inline-flex shrink-0 items-center gap-1 ${styles.meta}`}>
              <Clock aria-hidden="true" size={13} />
              {deadlineLabel(caseItem.voteDeadlineAt)}
            </span>
          </div>
          <p className={`line-clamp-1 ${styles.summary}`}>{caseItem.aiSummary}</p>
          <div className={`flex min-w-0 items-center gap-3 whitespace-nowrap ${styles.meta}`}>
            <span className="inline-flex items-center gap-1">
              <Users aria-hidden="true" size={13} />
              <b className="text-[#FF3D00]">{voteCount}</b>/{caseItem.maxJurors}
            </span>
            <span className="inline-flex items-center gap-1">
              <ViewCountIcon size={13} />
              {caseItem.viewCount.toLocaleString("ko-KR")}
            </span>
          </div>
        </div>
        <span className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#767986] transition group-active:bg-[#F5F5F7]">
          <ChevronRight aria-hidden="true" size={20} />
        </span>
      </Link>
    );
  }

  const styles = cardStyle.compact;

  return (
    <Link
      href={closed ? `/cases/${caseItem.id}/verdict` : `/cases/${caseItem.id}`}
      prefetch={false}
      className={`${styles.wrapper} group relative flex min-h-[100px] items-stretch overflow-hidden transition active:scale-[0.99]`}
    >
      <CaseCoverImage image={coverImage} title={caseItem.title} className={`${styles.image} shrink-0 self-center`} />
      <div className="grid min-w-0 flex-1 grid-rows-[auto_auto_auto_auto] content-center gap-y-0.5 pr-9">
        <p className={`truncate ${styles.category}`}>{caseItem.category}</p>
        <h3 className={`line-clamp-1 ${styles.title}`}>{caseItem.title}</h3>
        <div className="flex min-w-0 items-center gap-2 whitespace-nowrap leading-5">
          <p
            className={[
              "min-w-0 truncate text-[12px] font-black",
              styles.verdict,
              hasFinalVerdict ? "text-[#FF3D00]" : "text-[#767986]"
            ].join(" ")}
          >
            {finalVerdict}
          </p>
          <span className={`inline-flex shrink-0 items-center gap-0.5 ${styles.meta}`}>
            <Clock aria-hidden="true" size={12} />
            {deadlineLabel(caseItem.voteDeadlineAt)}
          </span>
        </div>
        <div className={`flex min-w-0 items-center gap-2 whitespace-nowrap ${styles.meta}`}>
          <span className="inline-flex items-center gap-1">
            <Users aria-hidden="true" size={12} />
            <b className="text-[#FF3D00]">{voteCount}</b>/{caseItem.maxJurors}
          </span>
          <span className="inline-flex items-center gap-1">
            <ViewCountIcon size={12} />
            {caseItem.viewCount.toLocaleString("ko-KR")}
          </span>
        </div>
      </div>
      <span className="absolute right-2.5 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#767986] transition group-active:bg-[#F5F5F7]">
        <ChevronRight aria-hidden="true" size={19} />
      </span>
    </Link>
  );
}
