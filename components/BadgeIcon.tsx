import { Award } from "lucide-react";

export function BadgeIcon({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[#FFD6C8] bg-[#FFF2EC] px-2.5 py-1.5 text-xs font-black text-[#FF3D00]">
      <Award aria-hidden="true" size={13} strokeWidth={2.5} />
      {label}
    </span>
  );
}
