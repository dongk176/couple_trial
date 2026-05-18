import clsx from "clsx";
import Image from "next/image";

function normalizeAvatarSrc(src: string) {
  if (!src.startsWith("https://")) return src;

  try {
    const url = new URL(src);
    if (url.hostname.endsWith(".amazonaws.com") && url.pathname.startsWith("/couple-court/profiles/")) {
      return `/api/profile-images${url.pathname}`;
    }
  } catch {
    return src;
  }

  return src;
}

export function UserAvatar({
  src,
  alt,
  size = "md"
}: {
  src: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const imageSrc = normalizeAvatarSrc(src);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={80}
      height={80}
      unoptimized={imageSrc.startsWith("/api/profile-images/")}
      className={clsx(
        "shrink-0 rounded-full border border-[#E8E8ED] bg-white object-cover shadow-[0_6px_16px_rgba(17,17,17,0.08)]",
        size === "xs" && "h-8 w-8",
        size === "sm" && "h-12 w-12",
        size === "md" && "h-14 w-14",
        size === "lg" && "h-24 w-24"
      )}
    />
  );
}
