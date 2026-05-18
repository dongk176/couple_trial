import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { CaseCreateForm } from "@/components/CaseCreateForm";
import { requireUser } from "@/lib/auth";
import { CASE_CATEGORIES } from "@/lib/constants";
import { getUserCouple } from "@/lib/services";

const errors: Record<string, string> = {
  required: "필수 항목을 모두 입력하세요.",
  category: "카테고리를 다시 선택하세요.",
  responseMode: "피고 답변 방식을 선택하세요.",
  deadline: "투표 시간을 다시 선택하세요.",
  imageCount: "사건 사진은 최대 3장까지 첨부할 수 있어요.",
  imageType: "JPG, PNG, WEBP, GIF 이미지만 첨부할 수 있어요.",
  imageSize: "사진은 한 장당 최대 4MB까지 첨부할 수 있어요.",
  imageUpload: "사진 업로드 저장소 설정이 필요해요."
};

export default async function NewCasePage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const couple = await getUserCouple(user.id);
  if (!couple || couple.status !== "CONNECTED") {
    redirect("/couple?from=case");
  }

  const params = await searchParams;
  const error = params?.error ? errors[params.error] : null;

  return (
    <div>
      <AppHeader avatar={user.avatar} nickname={user.nickname} title="사건 등록" backHref="/home" />

      <section className="pt-3">
        <h1 className="text-[22px] font-black leading-tight text-neutral-950">새 사건 등록</h1>
        <p className="mt-1.5 text-xs font-semibold leading-5 text-[#767986]">피고 답변을 직접 쓰거나, 피고에게 답변을 요청할 수 있습니다.</p>
      </section>

      {error ? (
        <div className="mt-3 rounded-[14px] border border-[#FFD6C8] bg-[#FFF2EC] px-3 py-2 text-xs font-bold text-[#F04411]">
          {error}
        </div>
      ) : null}

      <CaseCreateForm
        categories={CASE_CATEGORIES}
        coupleNames={[couple.userA.nickname, couple.userB?.nickname].filter(Boolean) as string[]}
      />
    </div>
  );
}
