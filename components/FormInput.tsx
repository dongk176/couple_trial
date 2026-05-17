import clsx from "clsx";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type Props =
  | ({ label: string; labelClassName?: string; textarea?: false } & InputHTMLAttributes<HTMLInputElement>)
  | ({ label: string; labelClassName?: string; textarea: true } & TextareaHTMLAttributes<HTMLTextAreaElement>);

const inputClass =
  "mt-3 w-full rounded-[18px] border border-[#E4E5EA] bg-white px-4 py-4 text-lg font-semibold text-neutral-950 outline-none transition placeholder:text-[#9A9CAA] focus:border-[#FF3D00] focus:ring-4 focus:ring-[#FF3D00]/10";

export function FormInput(props: Props) {
  const { label, labelClassName, textarea, className, ...rest } = props;
  return (
    <label className={clsx("block text-base font-black text-neutral-950", labelClassName)}>
      {label}
      {textarea ? (
        <textarea
          className={clsx(inputClass, "min-h-32 resize-none leading-6", className)}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input className={clsx(inputClass, className)} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
      )}
    </label>
  );
}
