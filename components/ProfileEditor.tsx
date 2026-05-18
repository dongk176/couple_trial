"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, Pencil, X } from "lucide-react";
import { updateMyProfile } from "@/lib/actions";
import { UserAvatar } from "@/components/UserAvatar";

type ProfileEditorProps = {
  user: {
    nickname: string;
    avatar: string;
  };
  juryTitle: string;
};

export function ProfileEditor({ user, juryTitle }: ProfileEditorProps) {
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  if (!editing) {
    return (
      <section className="flex items-center gap-4 pt-5">
        <div className="relative w-fit">
          <UserAvatar src={user.avatar} alt={`${user.nickname} 프로필`} size="md" />
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#FF3D00]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <h1 className="min-w-0 truncate text-[25px] font-black leading-none text-neutral-950">{user.nickname}</h1>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="프로필 수정"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F5F5F7] text-[#767986] active:scale-95"
            >
              <Pencil aria-hidden="true" size={14} />
            </button>
          </div>
          <p className="mt-2 text-sm font-semibold text-[#767986]">{juryTitle}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="ios-card mt-5 p-3">
      <form action={updateMyProfile} className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-dashed border-[#FFB49D] bg-[#FFF2EC] text-[#FF3D00]"
            aria-label="프로필 사진 변경"
          >
            {preview ? (
              <Image src={preview} alt="선택한 프로필 사진" fill unoptimized className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <UserAvatar src={user.avatar} alt={`${user.nickname} 프로필`} size="md" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FF3D00] text-white shadow-sm">
              <Camera aria-hidden="true" size={13} />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            name="avatarUpload"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="min-w-0 flex-1">
            <label htmlFor="profile-nickname" className="text-xs font-black text-neutral-950">
              이름
            </label>
            <input
              id="profile-nickname"
              name="nickname"
              defaultValue={user.nickname}
              maxLength={20}
              className="mt-1 h-10 w-full rounded-[14px] border border-[#E8E8ED] bg-white px-3 text-sm font-bold text-neutral-950 outline-none focus:border-[#FF3D00]"
            />
            <p className="mt-1 text-[11px] font-semibold text-[#8A8D98]">사진은 최대 4MB까지 변경할 수 있어요.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              if (preview) URL.revokeObjectURL(preview);
              setPreview(null);
              setEditing(false);
            }}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-[#E8E8ED] bg-white text-sm font-black text-neutral-700"
          >
            <X aria-hidden="true" size={15} />
            취소
          </button>
          <button className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-[#FF3D00] text-sm font-black text-white shadow-[0_8px_18px_rgba(255,61,0,0.22)]">
            <Check aria-hidden="true" size={15} />
            저장
          </button>
        </div>
      </form>
    </section>
  );
}
