"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { SentenceOption } from "@/components/SentenceOption";
import { VoteOption } from "@/components/VoteOption";
import { submitVote } from "@/lib/actions";
import {
  JURY_COMMENT_MAX_LENGTH,
  NO_SENTENCE_VERDICTS,
  SENTENCE_OPTIONS,
  VERDICT_OPTIONS
} from "@/lib/constants";

export function JuryVoteForm({ caseId }: { caseId: string }) {
  const [selectedVerdict, setSelectedVerdict] = useState("");
  const [comment, setComment] = useState("");
  const hideSentence = NO_SENTENCE_VERDICTS.includes(selectedVerdict);

  return (
    <form action={submitVote} className="mt-4 space-y-5">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <p className="mb-3 text-lg font-black text-neutral-950">판결 선택</p>
        <div className="grid grid-cols-2 gap-3">
          {VERDICT_OPTIONS.map((option) => (
            <VoteOption
              checked={selectedVerdict === option}
              key={option}
              onChange={() => setSelectedVerdict(option)}
              value={option}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-lg font-black text-neutral-950">형량 선택</p>
          {hideSentence ? (
          <span className="rounded-full bg-[#FFF2EC] px-3 py-1 text-xs font-black text-[#FF3D00]">
              형량 없음
            </span>
          ) : null}
        </div>
        <div
          aria-hidden={hideSentence}
          className={[
            "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out",
            hideSentence ? "grid-rows-[0fr] -translate-y-1 opacity-0" : "grid-rows-[1fr] translate-y-0 opacity-100"
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              {SENTENCE_OPTIONS.map((option) => (
                <SentenceOption
                  disabled={hideSentence}
                  key={option.label}
                  required={!hideSentence}
                  value={option.label}
                />
              ))}
            </div>
          </div>
        </div>
        {hideSentence ? (
          <p className="mt-3 rounded-[18px] bg-white px-4 py-3 text-sm font-bold leading-6 text-neutral-500 shadow-sm">
            이 판결은 형량 선택 없이 제출돼요.
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <label className="flex items-center gap-1.5 text-lg font-black text-neutral-950" htmlFor="jury-comment">
            <MessageCircle aria-hidden="true" size={16} />
            배심원 한 마디
          </label>
          <span className="text-xs font-black text-neutral-400">
            {comment.length}/{JURY_COMMENT_MAX_LENGTH}
          </span>
        </div>
        <textarea
          className="min-h-[84px] w-full resize-none rounded-[16px] border border-[#E4E5EA] bg-white px-4 py-3 text-base font-bold leading-6 text-neutral-950 shadow-sm outline-none placeholder:text-[#9A9CAA] focus:border-[#FF3D00]"
          id="jury-comment"
          maxLength={JURY_COMMENT_MAX_LENGTH}
          name="comment"
          onChange={(event) => setComment(event.target.value)}
          placeholder="짧게 한 줄로 남겨주세요"
          rows={2}
          value={comment}
        />
      </div>

      <button className="brand-gradient min-h-[58px] w-full rounded-[18px] px-5 py-3 text-xl font-black text-white shadow-[0_10px_22px_rgba(255,61,0,0.22)]">
        배심 제출
      </button>
    </form>
  );
}
