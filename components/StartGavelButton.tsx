"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { primaryButtonClass } from "@/components/PrimaryButton";

export function StartGavelButton() {
  const router = useRouter();
  const [playing, setPlaying] = useState(false);

  function handleStart() {
    if (playing) return;
    setPlaying(true);

    window.setTimeout(() => {
      router.push("/signup");
    }, 1250);
  }

  return (
    <>
      <button type="button" onClick={handleStart} className={`${primaryButtonClass} w-full !min-h-12 !py-3 !text-base !text-white`}>
        시작하기
      </button>

      {playing ? (
        <div className="court-hit-overlay" aria-hidden="true">
          <div className="court-hit-screen">
            <svg className="gavel-stage" viewBox="0 0 260 260" role="img" aria-label="판사봉이 세 번 내려치는 애니메이션">
              <defs>
                <linearGradient id="gavelHead" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#B66B33" />
                  <stop offset="100%" stopColor="#603019" />
                </linearGradient>
                <linearGradient id="gavelHandle" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#5A2B15" />
                  <stop offset="52%" stopColor="#9B5428" />
                  <stop offset="100%" stopColor="#4B2512" />
                </linearGradient>
                <linearGradient id="gavelGold" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#F0CA7A" />
                  <stop offset="100%" stopColor="#BD812D" />
                </linearGradient>
              </defs>

              <ellipse cx="126" cy="194" rx="62" ry="13" fill="rgba(0,0,0,0.10)" />
              <g className="gavel-base">
                <ellipse cx="126" cy="177" rx="54" ry="18" fill="#FF3D00" />
                <rect x="72" y="157" width="108" height="24" rx="12" fill="#8E2828" />
                <ellipse cx="126" cy="158" rx="54" ry="18" fill="#B14141" />
                <ellipse cx="126" cy="156" rx="34" ry="9" fill="rgba(255,255,255,0.22)" />
              </g>

              <g className="impact-lines impact-lines-1">
                <path d="M72 145L54 133" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
                <path d="M102 126L96 104" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
                <path d="M151 128L164 108" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
                <path d="M179 150L201 139" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
              </g>
              <g className="impact-lines impact-lines-2">
                <path d="M72 145L54 133" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
                <path d="M102 126L96 104" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
                <path d="M151 128L164 108" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
                <path d="M179 150L201 139" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
              </g>
              <g className="impact-lines impact-lines-3">
                <path d="M72 145L54 133" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
                <path d="M102 126L96 104" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
                <path d="M151 128L164 108" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
                <path d="M179 150L201 139" stroke="#FF3D00" strokeWidth="5" strokeLinecap="round" />
              </g>

              <g className="gavel-swing">
                <rect x="140" y="120" width="100" height="18" rx="9" fill="url(#gavelHandle)" />
                <circle cx="238" cy="129" r="11" fill="#5A2B15" />
                <rect x="108" y="86" width="36" height="86" rx="13" fill="url(#gavelHead)" />
                <circle cx="144" cy="129" r="11" fill="#6F371B" />
                <rect x="96" y="72" width="60" height="28" rx="14" fill="url(#gavelHead)" />
                <rect x="96" y="158" width="60" height="28" rx="14" fill="url(#gavelHead)" />
                <rect x="96" y="109" width="60" height="8" rx="4" fill="url(#gavelGold)" />
                <rect x="96" y="141" width="60" height="8" rx="4" fill="url(#gavelGold)" />
                <path d="M118 96V153" stroke="rgba(255,255,255,0.20)" strokeWidth="5" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </div>
      ) : null}
    </>
  );
}
