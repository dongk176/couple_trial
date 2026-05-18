const CASE_ICON_BASE = "/case icons";

const DEFAULT_CASE_IMAGE_BY_CATEGORY: Record<string, string> = {
  "연락/소통": `${CASE_ICON_BASE}/talk.png`,
  "기념일": `${CASE_ICON_BASE}/event.png`,
  "기념일/이벤트": `${CASE_ICON_BASE}/event.png`,
  "SNS/온라인": `${CASE_ICON_BASE}/sns.png`,
  "생활/습관": `${CASE_ICON_BASE}/habit.png`,
  "돈 문제": `${CASE_ICON_BASE}/Money.png`,
  "약속": `${CASE_ICON_BASE}/promise.png`,
  "말투": `${CASE_ICON_BASE}/accent.png`,
  "기타": `${CASE_ICON_BASE}/other.png`
};

function isAllowedCaseImage(image: string) {
  return (
    image.length < 800 &&
    (image.startsWith("/uploads/cases/") ||
      image.startsWith(`${CASE_ICON_BASE}/`) ||
      image.startsWith("/case%20icons/") ||
      image.startsWith("https://") ||
      image.startsWith("/api/case-images/"))
  );
}

function normalizeCaseImage(image: string) {
  if (!image.startsWith("https://")) return image;

  try {
    const url = new URL(image);
    if (url.hostname.endsWith(".amazonaws.com") && url.pathname.startsWith("/couple-court/cases/")) {
      return `/api/case-images${url.pathname}`;
    }
  } catch {
    return image;
  }

  return image;
}

export function getDefaultCaseImage(category: string | null | undefined) {
  const normalized = String(category || "").trim();
  return DEFAULT_CASE_IMAGE_BY_CATEGORY[normalized] || DEFAULT_CASE_IMAGE_BY_CATEGORY["기타"];
}

export function parseCaseImages(raw: string | null | undefined) {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((image): image is string => typeof image === "string" && isAllowedCaseImage(image))
      .map(normalizeCaseImage);
  } catch {
    return [];
  }
}

export function getCaseImages(raw: string | null | undefined, category: string | null | undefined) {
  const images = parseCaseImages(raw);
  return images.length ? images : [getDefaultCaseImage(category)];
}
