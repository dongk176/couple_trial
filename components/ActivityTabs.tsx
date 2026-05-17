"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

type VoteActivity = {
  id: string;
  caseId: string;
  title: string;
  category: string;
  verdict: string;
  sentenceLabel: string;
  createdAt: string;
};

type CreatedActivity = {
  id: string;
  title: string;
  category: string;
  status: string;
  voteCount: number;
  createdAt: string;
};

export function ActivityTabs({
  votes,
  createdCases
}: {
  votes: VoteActivity[];
  createdCases: CreatedActivity[];
}) {
  const [tab, setTab] = useState<"votes" | "created">("votes");

  return (
    <section className="mt-6">
      <div className="grid grid-cols-2 rounded-[18px] bg-[#F3F3F5] p-1">
        <button
          type="button"
          onClick={() => setTab("votes")}
          className={clsx(
            "min-h-[58px] rounded-[15px] text-lg font-black transition",
            tab === "votes" ? "bg-white text-[#FF3D00] shadow-sm" : "text-neutral-500"
          )}
        >
          배심 기록
        </button>
        <button
          type="button"
          onClick={() => setTab("created")}
          className={clsx(
            "min-h-[58px] rounded-[15px] text-lg font-black transition",
            tab === "created" ? "bg-white text-[#FF3D00] shadow-sm" : "text-neutral-500"
          )}
        >
          작성한 사건
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {tab === "votes"
          ? votes.map((vote) => (
              <Link
                key={vote.id}
                href={`/cases/${vote.caseId}`}
                className="ios-card block p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-[#FF3D00]">{vote.category}</p>
                    <h3 className="mt-2 text-[22px] font-black leading-7 text-neutral-950">{vote.title}</h3>
                    <p className="mt-2 text-sm font-semibold text-neutral-500">{vote.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-black text-neutral-700">
                      {vote.verdict}
                    </p>
                    <p className="mt-2 text-sm font-black text-[#FF3D00]">{vote.sentenceLabel}</p>
                  </div>
                </div>
              </Link>
            ))
          : createdCases.map((caseItem) => (
              <Link
                key={caseItem.id}
                href={`/cases/${caseItem.id}`}
                className="ios-card block p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-black text-[#FF3D00]">{caseItem.category}</p>
                    <h3 className="mt-2 text-[22px] font-black leading-7 text-neutral-950">{caseItem.title}</h3>
                    <p className="mt-2 text-sm font-semibold text-neutral-500">{caseItem.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-black text-neutral-700">
                      {caseItem.status}
                    </p>
                    <p className="mt-2 text-sm font-black text-[#FF3D00]">{caseItem.voteCount}명</p>
                  </div>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}
