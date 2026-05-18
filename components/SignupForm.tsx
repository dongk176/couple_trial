"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { FormInput } from "@/components/FormInput";
import { PrimaryButton } from "@/components/PrimaryButton";
import { signup } from "@/lib/actions";
import { AVATAR_OPTIONS } from "@/lib/constants";

type StepId = "realName" | "gender" | "birthInfo" | "phoneNumber";
type SignupValues = {
  realName: string;
  gender: string;
  birthday: string;
  birthYear: string;
  phoneNumber: string;
};

const steps: Array<{
  id: StepId;
  title: string;
  subtitle: string;
  placeholder?: string;
  inputMode?: "text" | "numeric" | "tel";
  type?: string;
  maxLength?: number;
}> = [
  {
    id: "realName",
    title: "이름을 알려주세요",
    subtitle: "본인 확인과 재판 기록 관리를 위해 이름을 입력해주세요.",
    placeholder: "예: 김서연",
    inputMode: "text",
    maxLength: 20
  },
  {
    id: "gender",
    title: "성별을 선택해주세요",
    subtitle: "커플법정 경험을 더 정확하게 맞추기 위해 사용됩니다."
  },
  {
    id: "birthInfo",
    title: "생년월일을 알려주세요",
    subtitle: "출생 연도와 생일을 함께 입력해주세요."
  },
  {
    id: "phoneNumber",
    title: "전화번호를 입력해주세요",
    subtitle: "재판 알림톡 이용을 위해 전화번호를 제출하기 전 다시 한 번 정확한 번호인지 확인해주세요.",
    placeholder: "예: 010-1234-5678",
    inputMode: "tel",
    type: "tel",
    maxLength: 16
  }
];

const genderOptions = ["여성", "남성", "기타"];
const overlayInputClass =
  "w-full rounded-[14px] border border-[#E4E5EA] bg-white px-3 py-3 text-base font-bold text-neutral-950 outline-none placeholder:text-[#9A9CAA] focus:border-[#FF3D00] focus:ring-4 focus:ring-[#FF3D00]/10";

function isValidBirthInfo(values: SignupValues) {
  if (!values.birthday.trim() || !values.birthYear.trim()) return false;
  const year = Number(values.birthYear);
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= 1900 && year <= currentYear;
}

function stepValue(step: StepId, values: SignupValues) {
  if (step === "birthInfo") return `${values.birthYear.trim()} ${values.birthday.trim()}`.trim();
  return values[step].trim();
}

function isValidStepValue(step: StepId, values: SignupValues) {
  const value = stepValue(step, values);
  if (!value) return false;
  if (step === "gender") return genderOptions.includes(value);
  if (step === "birthInfo") return isValidBirthInfo(values);
  if (step === "phoneNumber") {
    return value.replace(/\D/g, "").length >= 10;
  }
  return true;
}

export function SignupForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [values, setValues] = useState<SignupValues>({
    realName: "",
    gender: "",
    birthday: "",
    birthYear: "",
    phoneNumber: ""
  });
  const [stepError, setStepError] = useState("");
  const currentStep = stepIndex === null ? null : steps[stepIndex];

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const selectUploadedAvatar = (file: File | undefined) => {
    if (!file) return;
    setSelectedAvatar("");
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  };

  const selectDefaultAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
    setAvatarPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const beginExtraSteps = () => {
    if (!formRef.current?.reportValidity()) return;
    setStepError("");
    setStepIndex(0);
  };

  const closeOverlay = () => {
    setStepError("");
    setStepIndex(null);
  };

  const submitStep = () => {
    if (!currentStep) return;

    if (!isValidStepValue(currentStep.id, values)) {
      setStepError(
        currentStep.id === "phoneNumber"
          ? "전화번호를 다시 확인해주세요."
          : currentStep.id === "birthInfo"
            ? "출생 연도와 생일을 입력해주세요."
            : "필수 정보를 입력해주세요."
      );
      return;
    }

    setStepError("");

    if (stepIndex === steps.length - 1) {
      formRef.current?.requestSubmit();
      return;
    }

    setStepIndex((index) => (index === null ? 0 : index + 1));
  };

  return (
    <>
      <form ref={formRef} action={signup} className="mt-5 min-w-0 space-y-3">
        <div>
          <h1 className="text-[18px] font-black leading-tight text-neutral-950">계정 만들기</h1>
        </div>

        <FormInput
          label="아이디"
          labelClassName="text-[13px]"
          name="loginId"
          autoComplete="username"
          placeholder="예: minji"
          className="mt-1 rounded-[10px] px-3 py-2 text-xs"
          required
        />
        <FormInput
          label="비밀번호"
          labelClassName="text-[13px]"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="비밀번호"
          className="mt-1 rounded-[10px] px-3 py-2 text-xs"
          minLength={6}
          required
        />
        <FormInput
          label="닉네임"
          labelClassName="text-[13px]"
          name="nickname"
          placeholder="예: 냉철한 민지"
          className="mt-1 rounded-[10px] px-3 py-2 text-xs"
          required
        />

        <fieldset className="min-w-0 overflow-hidden">
          <legend className="text-[13px] font-black text-neutral-950">
            프로필 이미지 <span className="font-semibold text-[#767986]">(선택)</span>
          </legend>
          <div className="mt-2 flex max-w-full min-w-0 gap-3 overflow-x-auto overscroll-x-contain pb-1">
            <label
              className={`relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-white text-[#767986] shadow-sm ${
                avatarPreview
                  ? "border-[#FF3D00] ring-2 ring-[#FF3D00]/12"
                  : "border-dashed border-[#B8BCC8]"
              }`}
            >
              <input
                ref={fileInputRef}
                className="sr-only"
                type="file"
                name="avatarUpload"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(event) => selectUploadedAvatar(event.target.files?.[0])}
              />
              {avatarPreview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview cannot be optimized by next/image. */}
                  <img src={avatarPreview} alt="선택한 프로필 이미지" className="h-full w-full rounded-full object-cover" />
                  <span className="absolute right-0.5 top-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF3D00] text-white shadow-sm">
                    <Check aria-hidden="true" size={13} strokeWidth={3} />
                  </span>
                </>
              ) : (
                <Plus aria-hidden="true" size={25} strokeWidth={2.4} />
              )}
            </label>
            {AVATAR_OPTIONS.map((avatar, index) => (
              <label
                key={avatar}
                className={`relative flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-full border bg-white shadow-sm ${
                  selectedAvatar === avatar ? "border-[#FF3D00] ring-2 ring-[#FF3D00]/12" : "border-[#E8E8ED]"
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="avatar"
                  value={avatar}
                  checked={selectedAvatar === avatar}
                  onChange={() => selectDefaultAvatar(avatar)}
                />
                <Image
                  src={avatar}
                  alt={`프로필 이미지 ${index + 1}`}
                  width={64}
                  height={64}
                  className="h-full w-full rounded-full object-cover"
                />
                {selectedAvatar === avatar ? (
                  <span className="absolute right-0.5 top-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#FF3D00] text-white shadow-sm">
                    <Check aria-hidden="true" size={13} strokeWidth={3} />
                  </span>
                ) : null}
              </label>
            ))}
          </div>
        </fieldset>

        <input type="hidden" name="realName" value={values.realName.trim()} readOnly />
        <input type="hidden" name="gender" value={values.gender.trim()} readOnly />
        <input type="hidden" name="birthday" value={values.birthday.trim()} readOnly />
        <input type="hidden" name="birthYear" value={values.birthYear.trim()} readOnly />
        <input type="hidden" name="phoneNumber" value={values.phoneNumber.trim()} readOnly />

        <PrimaryButton type="button" onClick={beginExtraSteps} className="w-full !min-h-11 !rounded-[12px] !py-2.5 !text-sm">
          가입하고 시작
        </PrimaryButton>
        <p className="text-center text-[11px] font-semibold leading-4 text-[#8A8D98]">
          가입하면 커플법정의{" "}
          <Link href="/privacy" className="font-black text-[#FF3D00]">
            개인정보 처리방침
          </Link>
          에 동의한 것으로 봅니다.
        </p>
      </form>

      {currentStep ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/35 px-4 pb-4">
          <div className="w-full max-w-[398px] rounded-[20px] border border-[#ECECF1] bg-white p-4 shadow-[0_18px_50px_rgba(17,17,17,0.18)]">
            <div className="mb-3 flex items-center gap-1.5">
              {steps.map((step, index) => (
                <span
                  key={step.id}
                  className={`h-1.5 flex-1 rounded-full ${index <= stepIndex! ? "bg-[#FF3D00]" : "bg-[#ECECF1]"}`}
                />
              ))}
            </div>
            <p className="text-xs font-black text-[#FF3D00]">{stepIndex! + 1} / {steps.length}</p>
            <h2 className="mt-1 text-[20px] font-black leading-7 text-neutral-950">{currentStep.title}</h2>
            <p className="mt-1.5 text-xs font-semibold leading-5 text-[#767986]">{currentStep.subtitle}</p>

            {currentStep.id === "gender" ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {genderOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setValues((current) => ({ ...current, gender: option }))}
                    className={`min-h-11 rounded-[12px] border text-sm font-black ${
                      values.gender === option
                        ? "border-[#FF3D00] bg-[#FFF2EC] text-[#FF3D00]"
                        : "border-[#E4E5EA] bg-white text-neutral-800"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : currentStep.id === "birthInfo" ? (
              <div className="mt-4 grid grid-cols-[0.9fr_1.1fr] gap-2">
                <label className="block">
                  <span className="text-xs font-black text-neutral-950">출생 연도</span>
                  <input
                    autoFocus
                    type="number"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="1998"
                    value={values.birthYear}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        birthYear: event.target.value
                      }))
                    }
                    className={`mt-1.5 ${overlayInputClass}`}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-black text-neutral-950">생일</span>
                  <input
                    type="text"
                    inputMode="text"
                    maxLength={12}
                    placeholder="03월 14일"
                    value={values.birthday}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        birthday: event.target.value
                      }))
                    }
                    className={`mt-1.5 ${overlayInputClass}`}
                  />
                </label>
              </div>
            ) : (
              <input
                autoFocus
                type={currentStep.type || "text"}
                inputMode={currentStep.inputMode}
                maxLength={currentStep.maxLength}
                placeholder={currentStep.placeholder}
                value={values[currentStep.id]}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    [currentStep.id]: event.target.value
                  }))
                }
                className="mt-4 w-full rounded-[14px] border border-[#E4E5EA] bg-white px-3 py-3 text-base font-bold text-neutral-950 outline-none placeholder:text-[#9A9CAA] focus:border-[#FF3D00] focus:ring-4 focus:ring-[#FF3D00]/10"
              />
            )}

            {stepError ? <p className="mt-2 text-xs font-bold text-[#F04411]">{stepError}</p> : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={closeOverlay}
                className="min-h-11 flex-1 rounded-[12px] border border-[#E4E5EA] bg-white text-sm font-black text-[#767986]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={submitStep}
                className="brand-gradient min-h-11 flex-[1.4] rounded-[12px] text-sm font-black text-white shadow-[0_8px_18px_rgba(255,61,0,0.22)]"
              >
                {stepIndex === steps.length - 1 ? "가입 완료" : "다음"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
