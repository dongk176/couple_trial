"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

function HomeIcon() {
  return (
    <svg aria-hidden="true" width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path d="M4 10.5L12 4L20 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.5V20H17.5V9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 20V14H14V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CourtIcon() {
  return (
    <svg aria-hidden="true" width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path d="M4 9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 20H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 9L12 4L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17 12V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg aria-hidden="true" width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 10C6 6.7 8.4 4 12 4C15.6 4 18 6.7 18 10V14.5L20 17.5H4L6 14.5V10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 20C10.4 20.6 11.1 21 12 21C12.9 21 13.6 20.6 14 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg aria-hidden="true" width="27" height="27" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12C14.2 12 16 10.2 16 8C16 5.8 14.2 4 12 4C9.8 4 8 5.8 8 8C8 10.2 9.8 12 12 12Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 20C5.8 16.8 8.4 15 12 15C15.6 15 18.2 16.8 19 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const tabs = [
  { href: "/home", label: "홈", icon: HomeIcon },
  { href: "/cases", label: "재판소", icon: CourtIcon },
  { href: "/cases/new", label: "사건 등록", icon: Plus },
  { href: "/notifications", label: "알림", icon: NotificationIcon },
  { href: "/me", label: "마이페이지", icon: ProfileIcon }
];

function isActiveTab(pathname: string, href: string) {
  if (href === "/home") return pathname === href;
  if (href === "/cases") {
    return pathname === "/cases" || (pathname.startsWith("/cases/") && !pathname.startsWith("/cases/new"));
  }
  if (href === "/cases/new") return pathname === "/cases/new";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="app-bottom-nav fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[430px] border-t border-[#E8E8ED] bg-white/94 px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActiveTab(pathname, tab.href);
          const isCreate = tab.href === "/cases/new";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              className={clsx(
                "flex min-h-[62px] flex-col items-center justify-center gap-1 text-[12px] font-black transition",
                active ? "text-[#FF3D00]" : "text-[#858895]"
              )}
            >
              <span
                className={clsx(
                  "inline-flex items-center justify-center transition-colors",
                  active ? "text-[#FF3D00]" : "text-[#858895]",
                  isCreate && "h-11 w-11 rounded-full border-2",
                  isCreate && active ? "border-[#FF3D00] bg-[#FFF2EC]" : "",
                  isCreate && !active ? "border-[#858895]" : ""
                )}
              >
                {isCreate ? <Icon aria-hidden="true" size={28} strokeWidth={active ? 2.7 : 2.25} /> : <Icon />}
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
