export function formatSentence(months: number, label?: string | null) {
  if (label === "무기징역" || months >= 9999) return "무기징역";
  if (label === "집행유예" || months === 0) return "집행유예";
  if (months % 12 === 0 && months >= 12) return `${months / 12}년`;
  return `${months}개월`;
}

export function formatAverageSentence(months: number) {
  if (!Number.isFinite(months) || months <= 0) return "집행유예";
  if (months >= 120) return "10년 이상";
  if (months >= 12) {
    const years = months / 12;
    return `${years.toFixed(years % 1 === 0 ? 0 : 1)}년`;
  }
  return `${months.toFixed(months % 1 === 0 ? 0 : 1)}개월`;
}

export function deadlineLabel(deadline: Date) {
  const diff = deadline.getTime() - Date.now();
  if (diff <= 0) return "투표 종료";
  const hours = Math.ceil(diff / (1000 * 60 * 60));
  if (hours < 24) return `${hours}시간 남음`;
  return `${Math.ceil(hours / 24)}일 남음`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function safeJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function percent(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}
