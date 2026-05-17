import Image from "next/image";
import clsx from "clsx";

export function LogoMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dimension = size === "lg" ? 74 : size === "sm" ? 32 : 54;

  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center justify-center overflow-hidden",
        size === "sm" && "h-8 w-8",
        size === "md" && "h-[54px] w-[54px]",
        size === "lg" && "h-[74px] w-[74px]"
      )}
    >
      <Image
        src="/logo/couple_trial.png"
        alt="커플법정 로고"
        width={dimension}
        height={dimension}
        priority={size === "lg"}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
