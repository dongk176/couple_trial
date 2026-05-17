import { SENTENCE_OPTIONS } from "@/lib/constants";

type CaseSummaryInput = {
  title: string;
  category: string;
  plaintiffStatement: string;
  defendantStatement?: string | null;
};

type VoteLike = {
  verdict: string;
  sentenceMonths: number;
  sentenceLabel: string;
};

type VerdictCaseLike = {
  title: string;
  category: string;
  plaintiffStatement: string;
  defendantStatement: string | null;
};

function shorten(text: string, size = 92) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= size) return normalized;
  return `${normalized.slice(0, size)}...`;
}

function countBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  return items.reduce<Record<string, number>>((acc, item) => {
    const value = String(item[key]);
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topLabel(counts: Record<string, number>, fallback: string) {
  const [top] = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return top?.[0] ?? fallback;
}

export function generateCaseSummary(caseItem: CaseSummaryInput) {
  const defendantStatement = caseItem.defendantStatement || "피고 답변이 아직 제출되지 않았습니다.";
  const issues = [
    `${caseItem.category} 상황에서 사전 합의가 충분했는지`,
    "상대방이 서운함을 느낄 만한 반복 패턴이 있었는지",
    "갈등 이후 사과와 회복 행동이 적절했는지"
  ];

  const hasPersonalInfo = /010-|카톡|주소|실명|전화번호/.test(
    `${caseItem.plaintiffStatement} ${defendantStatement}`
  );
  const hasAbuse = /멍청|쓰레기|꺼져|욕/.test(`${caseItem.plaintiffStatement} ${defendantStatement}`);

  return {
    aiSummary: `${caseItem.title}은 ${caseItem.category} 영역에서 벌어진 커플 갈등입니다. 핵심은 기대치, 설명의 충분성, 이후 회복 행동입니다.`,
    aiPlaintiffSummary: shorten(caseItem.plaintiffStatement),
    aiDefendantSummary: shorten(defendantStatement),
    aiIssues: issues,
    aiWarning: {
      hasPersonalInfo,
      hasAbuse,
      message:
        hasPersonalInfo || hasAbuse
          ? "개인정보 또는 과격한 표현이 포함됐을 수 있어 운영자 확인이 필요합니다."
          : "개인정보와 과격한 표현은 발견되지 않았습니다."
    }
  };
}

export function generateVerdict(caseItem: VerdictCaseLike, votes: VoteLike[]) {
  const verdictCounts = countBy(votes, "verdict");
  const sentenceCounts = countBy(votes, "sentenceLabel");
  const finalVerdict = topLabel(verdictCounts, "화해 권고");
  const sentenceLabel = topLabel(sentenceCounts, "집행유예");
  const sentenceMonths = SENTENCE_OPTIONS.find((item) => item.label === sentenceLabel)?.months ?? 0;

  const voteSummary = {
    total: votes.length,
    verdictCounts,
    sentenceCounts
  };

  const reason =
    finalVerdict === "화해 권고"
      ? "양측 모두 관계 회복 의지가 있고 책임이 한쪽에만 집중되기 어렵습니다."
      : `${caseItem.category} 갈등에서 배심원들은 '${finalVerdict}' 판단이 더 설득력 있다고 보았습니다.`;

  return {
    finalVerdict,
    sentenceMonths,
    sentenceLabel,
    voteSummary,
    aiVerdictText: `AI 재판부는 배심원 ${votes.length}명의 판단을 종합해 '${finalVerdict}' 판결을 내립니다. 최종 형량은 ${sentenceLabel}입니다. ${reason} 감정의 회복을 위해서는 단순한 사과보다 재발 방지 약속과 구체적인 행동이 필요합니다.`,
    reductionMissions: [
      { title: "사과문 작성", reduction: "-3개월" },
      { title: "데이트 코스 준비", reduction: "-6개월" },
      { title: "손편지 작성", reduction: "-1년" },
      { title: "상대방 용서 승인", reduction: "집행유예" }
    ]
  };
}
