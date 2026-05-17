import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

export const primaryButtonClass =
  "brand-gradient inline-flex min-h-[58px] items-center justify-center gap-2 rounded-[18px] px-6 py-4 text-lg font-black text-white shadow-[0_12px_26px_rgba(255,61,0,0.24)] transition active:scale-[0.98] disabled:opacity-60";

export function PrimaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={clsx(primaryButtonClass, className)} {...props} />;
}
