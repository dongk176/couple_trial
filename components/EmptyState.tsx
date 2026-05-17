import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#E5E5E5] bg-white p-8 text-center">
      <p className="text-lg font-black text-neutral-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-neutral-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
