import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
}) {
  return (
    <div className="ios-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[#767986]">{label}</p>
        {icon ? <div className="text-[#FF3D00]">{icon}</div> : null}
      </div>
      <p className="mt-3 text-[28px] font-black leading-none text-neutral-950">{value}</p>
    </div>
  );
}
