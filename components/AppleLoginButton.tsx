"use client";

import clsx from "clsx";
import { useState } from "react";

declare global {
  interface Window {
    webkit?: {
      messageHandlers?: {
        appleLogin?: {
          postMessage: (message: unknown) => void;
        };
      };
    };
  }
}

export function AppleLoginButton({ className }: { className?: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  function handleAppleLogin() {
    const appleLoginBridge = window.webkit?.messageHandlers?.appleLogin;

    if (!appleLoginBridge) {
      setMessage("Apple 로그인은 앱에서 사용할 수 있어요.");
      return;
    }

    setMessage("");
    setPending(true);
    appleLoginBridge.postMessage({ source: "onboarding" });
    window.setTimeout(() => setPending(false), 2500);
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={handleAppleLogin}
        disabled={pending}
        className={clsx(
          "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-neutral-950 px-4 py-3 text-sm font-black text-white shadow-[0_10px_22px_rgba(17,17,17,0.18)] transition active:scale-[0.98] disabled:opacity-70",
          className
        )}
      >
        <span className="text-[17px] leading-none" aria-hidden="true"></span>
        {pending ? "Apple 로그인 준비 중" : "Apple로 로그인"}
      </button>
      {message ? <p className="text-center text-[11px] font-semibold text-[#767986]">{message}</p> : null}
    </div>
  );
}
