export type ReviewCase = {
  id: string;
  category: string;
  title: string;
  summary: string;
  plaintiff: string;
  defendant: string;
  finalVerdict: string;
  sentenceLabel: string;
  votesForPlaintiff: number;
  totalVotes: number;
  views: number;
  issues: string[];
  missions: Array<{
    title: string;
    reduction: string;
    body: string;
  }>;
};

export const reviewCases: ReviewCase[] = [
  {
    id: "birthday",
    category: "기념일",
    title: "생일 까먹은 사건",
    summary: "3년 연속 생일을 잊은 상황에서 사과와 재발 방지가 쟁점입니다.",
    plaintiff: "기념일을 크게 챙기자는 뜻은 아니지만, 3년 연속 생일을 잊은 건 마음이 너무 상했습니다.",
    defendant: "업무 일정 때문에 정신이 없었습니다. 의도적으로 무시한 것은 아니고 앞으로 캘린더에 꼭 기록하겠습니다.",
    finalVerdict: "원고 승",
    sentenceLabel: "집행유예 6개월",
    votesForPlaintiff: 72,
    totalVotes: 100,
    views: 842,
    issues: ["반복된 기념일 누락", "사과의 진정성", "재발 방지 약속"],
    missions: [
      { title: "사과문 작성", reduction: "-3개월", body: "상대가 서운했던 지점을 직접 인정해요." },
      { title: "데이트 코스 준비", reduction: "-6개월", body: "상대 취향에 맞춘 하루를 준비해요." },
      { title: "손편지 작성", reduction: "-1년", body: "짧아도 직접 쓴 편지로 마음을 전해요." }
    ]
  },
  {
    id: "reply-delay",
    category: "연락/소통",
    title: "읽씹 12시간 사건",
    summary: "연락 텀이 길어진 이유와 사전 공유 여부가 핵심입니다.",
    plaintiff: "읽은 표시가 뜬 뒤 12시간 동안 답이 없어 계속 불안했습니다.",
    defendant: "회의와 이동이 이어져 답장을 못 했습니다. 늦을 것 같으면 먼저 말하겠습니다.",
    finalVerdict: "쌍방과실",
    sentenceLabel: "형량 없음",
    votesForPlaintiff: 48,
    totalVotes: 86,
    views: 621,
    issues: ["읽음 후 장시간 무응답", "개인 일정 존중", "연락 규칙 합의"],
    missions: [
      { title: "연락 규칙 정하기", reduction: "화해", body: "바쁠 때 남길 짧은 문구를 함께 정해요." },
      { title: "감정 공유", reduction: "화해", body: "불안했던 이유와 부담됐던 이유를 각각 말해요." }
    ]
  },
  {
    id: "instagram-like",
    category: "SNS/온라인",
    title: "전애인 인스타 좋아요 사건",
    summary: "SNS 행동의 의미와 관계 신뢰의 기준이 쟁점입니다.",
    plaintiff: "전 애인의 게시물에 계속 좋아요를 누르는 건 현재 관계를 가볍게 보는 행동 같습니다.",
    defendant: "별 의미 없이 눌렀습니다. 불편했다면 앞으로 하지 않겠습니다.",
    finalVerdict: "화해 권고",
    sentenceLabel: "형량 없음",
    votesForPlaintiff: 41,
    totalVotes: 77,
    views: 536,
    issues: ["전 연인 SNS 반응", "상대 감정 고려", "커플 간 경계선 합의"],
    missions: [
      { title: "SNS 기준 합의", reduction: "화해", body: "서로 불편한 행동의 기준을 명확히 정해요." },
      { title: "신뢰 회복 대화", reduction: "화해", body: "숨기지 않고 설명하는 시간을 가져요." }
    ]
  },
  {
    id: "late-date",
    category: "약속",
    title: "약속 시간 2시간 늦은 사건",
    summary: "반복 지각과 사전 연락 여부가 중요한 판단 기준입니다.",
    plaintiff: "약속 장소에서 두 시간을 기다렸고, 늦는다는 연락도 너무 늦게 받았습니다.",
    defendant: "교통 문제와 준비 부족이 겹쳤습니다. 기다리게 한 점은 분명히 잘못했습니다.",
    finalVerdict: "원고 승",
    sentenceLabel: "징역 3개월",
    votesForPlaintiff: 64,
    totalVotes: 91,
    views: 712,
    issues: ["장시간 지각", "늦은 사전 연락", "반복 가능성"],
    missions: [
      { title: "다음 약속 직접 준비", reduction: "-1개월", body: "장소와 시간을 먼저 정하고 확인해요." },
      { title: "10분 전 도착 챌린지", reduction: "-2개월", body: "다음 세 번의 약속에서 먼저 도착해요." }
    ]
  }
];

export function getReviewCase(id: string) {
  return reviewCases.find((reviewCase) => reviewCase.id === id);
}
