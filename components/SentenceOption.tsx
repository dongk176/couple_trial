import { ShieldCheck } from "lucide-react";

export function SentenceOption({
  value,
  name = "sentenceLabel",
  disabled = false,
  required = true
}: {
  value: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className="group relative flex min-h-14 cursor-pointer items-center justify-center rounded-[14px] border border-[#E4E5EA] bg-white px-4 py-2 text-base font-black text-neutral-800 has-[:checked]:border-[#FF3D00] has-[:checked]:bg-[#FFF2EC] has-[:checked]:text-[#FF3D00] has-[:disabled]:cursor-default has-[:disabled]:opacity-60">
      <input
        className="peer sr-only"
        disabled={disabled}
        name={name}
        required={required}
        type="radio"
        value={value}
      />
      <ShieldCheck aria-hidden="true" className="mr-1.5 hidden peer-checked:block" size={15} />
      {value}
    </label>
  );
}
