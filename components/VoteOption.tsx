import { CheckCircle2 } from "lucide-react";
import type { ChangeEventHandler } from "react";

export function VoteOption({
  value,
  name = "verdict",
  checked,
  onChange,
  required = true
}: {
  value: string;
  name?: string;
  checked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
}) {
  return (
    <label className="group relative flex min-h-[74px] cursor-pointer flex-col items-center justify-center rounded-[14px] border border-[#E4E5EA] bg-white px-3 py-3 text-center text-base font-black text-neutral-900 shadow-sm has-[:checked]:border-[#FF3D00] has-[:checked]:bg-[#FFF2EC]">
      <span>{value}</span>
      <input
        checked={checked}
        className="peer sr-only"
        name={name}
        onChange={onChange}
        required={required}
        type="radio"
        value={value}
      />
      <CheckCircle2
        aria-hidden="true"
        className="mt-2 text-neutral-300 peer-checked:text-[#FF3D00]"
        size={19}
        strokeWidth={2.4}
      />
    </label>
  );
}
