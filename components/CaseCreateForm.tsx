"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { ImagePlus, MessageSquareReply, PencilLine, X } from "lucide-react";
import { CategoryChip } from "@/components/CategoryChip";
import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { createCase } from "@/lib/actions";

type ResponseMode = "request" | "direct";
type VoteDuration = "1" | "6" | "12" | "24";

const voteDurationOptions: Array<{
  value: VoteDuration;
  label: string;
  title: string;
  examples: string;
}> = [
  {
    value: "1",
    label: "1시간",
    title: "가벼운 즉결 재판",
    examples: "밥 메뉴, 말투 오해, 사소한 연락 타이밍처럼 바로 판단해도 되는 사건"
  },
  {
    value: "6",
    label: "6시간",
    title: "당일 배심 추천",
    examples: "읽씹, 약속 변경, 데이트 코스 불만처럼 몇 명 의견만 봐도 충분한 사건"
  },
  {
    value: "12",
    label: "12시간",
    title: "맥락 확인 재판",
    examples: "기념일, SNS 좋아요, 반복된 습관처럼 양쪽 입장을 천천히 볼 사건"
  },
  {
    value: "24",
    label: "24시간",
    title: "의견 많이 필요한 재판",
    examples: "돈 문제, 반복 갈등, 오래 쌓인 약속 문제처럼 배심 의견을 많이 모을 사건"
  }
];

export function CaseCreateForm({
  categories,
  coupleNames
}: {
  categories: string[];
  coupleNames: string[];
}) {
  const [responseMode, setResponseMode] = useState<ResponseMode>("request");
  const [noticeMode, setNoticeMode] = useState<ResponseMode | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [voteDuration, setVoteDuration] = useState<VoteDuration>("24");
  const directMode = responseMode === "direct";
  const selectedDuration = voteDurationOptions.find((option) => option.value === voteDuration) || voteDurationOptions[3];

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  function selectResponseMode(mode: ResponseMode) {
    setResponseMode(mode);
    setNoticeMode(mode);
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []).slice(0, 3);
    if (event.target.files && event.target.files.length > 3) {
      const dataTransfer = new DataTransfer();
      selectedFiles.forEach((file) => dataTransfer.items.add(file));
      event.target.files = dataTransfer.files;
    }
    setImagePreviews(selectedFiles.map((file) => URL.createObjectURL(file)));
  }

  return (
    <>
      <form action={createCase} className="mt-4 space-y-3">
        <section className="ios-card p-3">
          <FormInput
            label="사건 제목 *"
            labelClassName="text-[13px]"
            name="title"
            placeholder="사건 제목을 입력해주세요"
            className="mt-1 rounded-[10px] px-3 py-2 text-xs"
            required
          />
        </section>

        <section className="ios-card p-3">
          <label className="block text-[13px] font-black text-neutral-950">
            사건 사진 <span className="text-[#767986]">(선택, 최대 3장)</span>
            <input
              type="file"
              name="caseImages"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={handleImageChange}
              className="sr-only"
            />
            <span className="mt-2 flex min-h-12 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border border-dashed border-[#FFD0C0] bg-[#FFF7F3] px-3 text-sm font-black text-[#FF3D00]">
              <ImagePlus aria-hidden="true" size={17} />
              사진 선택하기
            </span>
          </label>
          <p className="mt-1.5 text-[11px] font-bold leading-4 text-[#767986]">
            JPG, PNG, WEBP, GIF만 가능하며 한 장당 최대 4MB까지 올릴 수 있어요.
          </p>
          {imagePreviews.length ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div key={preview} className="relative h-[74px] overflow-hidden rounded-[14px] bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={`첨부 사진 ${index + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="ios-card p-3">
          <p id="case-category-label" className="text-[13px] font-black text-neutral-950">
            카테고리 *
          </p>
          <div role="radiogroup" aria-labelledby="case-category-label" className="mt-3 grid grid-cols-2 gap-2">
            {categories.map((category, index) => (
              <label key={category} className="cursor-pointer">
                <input
                  className="peer sr-only"
                  type="radio"
                  name="category"
                  value={category}
                  defaultChecked={index === 0}
                />
                <span className="inline-flex min-h-10 w-full items-center justify-center rounded-[12px] border border-[#E4E5EA] bg-white px-2 py-1.5 text-xs font-black text-[#555966] peer-checked:border-[#FF3D00] peer-checked:bg-[#FFF2EC] peer-checked:text-[#FF3D00]">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="ios-card p-3">
          <FormInput
            label="내 주장 *"
            labelClassName="text-[13px]"
            name="plaintiffStatement"
            textarea
            placeholder="이 사건에 대해 당신의 입장을 자세히 적어주세요."
            className="mt-1 min-h-24 rounded-[10px] px-3 py-2 text-xs"
            required
          />
        </section>

        <section className="ios-card p-3">
          <p id="response-mode-label" className="text-[13px] font-black text-neutral-950">
            피고 답변 방식 *
          </p>
          <div role="radiogroup" aria-labelledby="response-mode-label" className="mt-2 grid gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-[12px] border border-[#E4E5EA] bg-white p-3 shadow-sm has-[:checked]:border-[#FF3D00] has-[:checked]:bg-[#FFF2EC]">
              <input
                checked={responseMode === "request"}
                className="sr-only"
                name="responseMode"
                onChange={() => selectResponseMode("request")}
                type="radio"
                value="request"
              />
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#FF3D00]">
                <MessageSquareReply aria-hidden="true" size={16} />
              </span>
              <span>
                <span className="block text-sm font-black text-neutral-950">피고에게 답변 요청</span>
                <span className="mt-0.5 block text-xs font-bold leading-4 text-neutral-500">
                  피고가 직접 답변하면 사건이 공개됩니다.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 rounded-[12px] border border-[#E4E5EA] bg-white p-3 shadow-sm has-[:checked]:border-[#FF3D00] has-[:checked]:bg-[#FFF2EC]">
              <input
                checked={responseMode === "direct"}
                className="sr-only"
                name="responseMode"
                onChange={() => selectResponseMode("direct")}
                type="radio"
                value="direct"
              />
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#FF3D00]">
                <PencilLine aria-hidden="true" size={16} />
              </span>
              <span>
                <span className="block text-sm font-black text-neutral-950">피고 답변 직접 작성</span>
                <span className="mt-0.5 block text-xs font-bold leading-4 text-neutral-500">
                  원고가 피고 답변까지 작성하고 바로 공개합니다.
                </span>
              </span>
            </label>
          </div>
        </section>

        <div
          className={[
            "grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out",
            directMode ? "grid-rows-[1fr] translate-y-0 opacity-100" : "grid-rows-[0fr] -translate-y-1 opacity-0"
          ].join(" ")}
        >
          <div className="overflow-hidden">
            <section className="ios-card p-3">
              <FormInput
                disabled={!directMode}
                label="피고 답변 *"
                labelClassName="text-[13px]"
                name="defendantStatement"
                placeholder="피고 입장 또는 이미 받은 답변을 적어주세요."
                className="mt-1 min-h-24 rounded-[10px] px-3 py-2 text-xs"
                required={directMode}
                textarea
              />
              <p className="mt-1.5 text-xs font-bold leading-4 text-[#767986]">
                직접 작성한 답변은 사건 상세에 원고 작성 답변으로 표시됩니다.
              </p>
            </section>
          </div>
        </div>

        <section className="ios-card p-3">
          <p id="vote-duration-label" className="text-[13px] font-black text-neutral-950">
            투표 시간 *
          </p>
          <div role="radiogroup" aria-labelledby="vote-duration-label" className="mt-3 grid grid-cols-2 gap-2">
            {voteDurationOptions.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  checked={voteDuration === option.value}
                  className="peer sr-only"
                  name="voteDurationHours"
                  onChange={() => setVoteDuration(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span className="flex min-h-10 w-full items-center justify-center rounded-[12px] border border-[#E4E5EA] bg-white px-2 py-1.5 text-xs font-black text-[#555966] peer-checked:border-[#FF3D00] peer-checked:bg-[#FFF2EC] peer-checked:text-[#FF3D00]">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-3 rounded-[12px] border border-[#FFD6C8] bg-[#FFF8F4] px-3 py-2">
            <p className="text-xs font-black text-[#FF3D00]">{selectedDuration.title}</p>
            <p className="mt-1 text-[11px] font-bold leading-4 text-[#666A75]">{selectedDuration.examples}</p>
          </div>
        </section>

        <div className="ios-card p-3">
          <p className="text-xs font-black text-neutral-950">연결된 커플 법정</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {coupleNames.map((name) => (
              <CategoryChip active key={name}>
                {name}
              </CategoryChip>
            ))}
          </div>
        </div>

        <PrimaryButton type="submit" className="w-full !min-h-11 !rounded-[12px] !py-2.5 !text-sm">
          {directMode ? "공개 사건 등록" : "피고에게 답변 요청"}
        </PrimaryButton>
      </form>

      {noticeMode ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 pb-[calc(18px+env(safe-area-inset-bottom))]">
          <section className="w-full max-w-[398px] rounded-[18px] bg-white p-5 shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF2EC] text-[#FF3D00]">
                  {noticeMode === "request" ? (
                    <MessageSquareReply aria-hidden="true" size={23} />
                  ) : (
                    <PencilLine aria-hidden="true" size={23} />
                  )}
                </span>
                <div>
                  <h2 className="text-xl font-black text-neutral-950">
                    {noticeMode === "request" ? "피고에게 답변 요청" : "피고 답변 직접 작성"}
                  </h2>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#666A75]">
                    {noticeMode === "request"
                      ? "피고에게 답변 요청을 보내면 답변 도착 후 사건이 공개됩니다."
                      : "직접 작성하면 바로 공개 재판에 올라갑니다."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setNoticeMode(null)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F3F5] text-[#767986]"
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setNoticeMode(null)}
              className="brand-gradient mt-5 min-h-[52px] w-full rounded-[18px] px-5 text-base font-black text-white"
            >
              확인
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
