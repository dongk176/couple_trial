export function parseCaseImages(raw: string | null | undefined) {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (image): image is string =>
        typeof image === "string" &&
        image.length < 800 &&
        (image.startsWith("/uploads/cases/") || image.startsWith("https://"))
    );
  } catch {
    return [];
  }
}
