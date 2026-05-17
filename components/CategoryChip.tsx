import clsx from "clsx";

export function CategoryChip({ children, active = false }: { children: string; active?: boolean }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-[10px] border px-3 py-1.5 text-sm font-black",
        active ? "border-[#FF3D00] bg-[#FF3D00] text-white" : "border-[#FFD6C8] bg-[#FFF2EC] text-[#FF3D00]"
      )}
    >
      {children}
    </span>
  );
}
