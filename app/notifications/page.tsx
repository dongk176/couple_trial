import Link from "next/link";
import { BellRing, CheckCheck } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { markAllNotificationsRead } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listNotifications } from "@/lib/services";

function NotificationItem({
  title,
  body,
  createdAt,
  unread,
  actionUrl
}: {
  title: string;
  body: string;
  createdAt: Date;
  unread: boolean;
  actionUrl?: string | null;
}) {
  const content = (
    <>
      {unread ? <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#FF3D00]" /> : null}
      <p className="pr-5 text-sm font-black text-neutral-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-neutral-500">{body}</p>
      {actionUrl ? <p className="mt-2 text-xs font-black text-[#FF3D00]">바로가기</p> : null}
      <p className="mt-2 text-[11px] font-bold text-neutral-400">{formatDate(createdAt)}</p>
    </>
  );

  if (actionUrl) {
    return (
      <Link
        href={actionUrl}
        className="relative block rounded-[16px] border border-[#FFD6C8] bg-[#FFF8F4] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
      >
        {content}
      </Link>
    );
  }

  return (
    <article className="relative rounded-[16px] border border-[#E8E8ED] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.05)]">
      {content}
    </article>
  );
}

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await listNotifications(user.id);
  const unread = notifications.filter((notification) => !notification.readAt);
  const read = notifications.filter((notification) => notification.readAt);

  return (
    <div>
      <AppHeader title="알림" backHref="/home" />

      <section className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[19px] font-black text-neutral-950">
              읽지 않은 알림 <span className="ml-1 rounded-full bg-[#FF3D00] px-2 py-0.5 text-xs text-white">{unread.length}</span>
            </h1>
            <p className="mt-1.5 text-xs font-semibold leading-5 text-[#767986]">재판 진행 상황과 배지 소식을 확인하세요.</p>
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[14px] bg-[#FFF2EC] text-[#FF3D00]">
            <BellRing aria-hidden="true" size={18} />
          </span>
        </div>
      </section>

      <form action={markAllNotificationsRead} className="mt-4">
        <button className="inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-full border border-[#E8E8ED] bg-white px-3 text-xs font-black text-[#FF3D00] shadow-sm">
          <CheckCheck aria-hidden="true" size={14} />
          모두 읽음
        </button>
      </form>

      <section className="mt-5">
        <h2 className="mb-2 text-[18px] font-black text-neutral-950">읽지 않은 알림</h2>
        {unread.length ? (
          <div className="space-y-2">
            {unread.map((notification) => (
              <NotificationItem key={notification.id} {...notification} unread />
            ))}
          </div>
        ) : (
          <EmptyState title="새 알림이 없어요" description="새로운 배심 참여나 판결 결과가 생기면 알려드릴게요." />
        )}
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[18px] font-black text-neutral-950">이전 알림</h2>
        {read.length ? (
          <div className="space-y-2">
            {read.map((notification) => (
              <NotificationItem key={notification.id} {...notification} unread={false} />
            ))}
          </div>
        ) : (
          <EmptyState title="이전 알림이 없어요" description="읽은 알림은 이곳에 정리됩니다." />
        )}
      </section>
    </div>
  );
}
