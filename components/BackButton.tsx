import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackButton({ href, label = "뒤로가기" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-neutral-950"
    >
      <ArrowLeft aria-hidden="true" size={20} strokeWidth={2.6} />
    </Link>
  );
}
