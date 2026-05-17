const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const avatars = [
  "/avatars/avatar-orange.svg",
  "/avatars/avatar-black.svg",
  "/avatars/avatar-cream.svg",
  "/avatars/avatar-pink.svg"
];

const verdictOptions = ["원고 승", "피고 승", "쌍방과실", "무죄", "화해 권고"];
const sentences = [
  ["집행유예", 0],
  ["1개월", 1],
  ["3개월", 3],
  ["6개월", 6],
  ["1년", 12],
  ["3년", 36],
  ["5년", 60],
  ["무기징역", 9999]
];

const mainInviteCodes = ["AB12CD", "EF34GH", "JK56LM", "NP78QR"];

function summaryFor(input) {
  const issues = [
    `${input.category} 문제에서 기대치가 서로 달랐는지`,
    "사전에 충분한 설명과 합의가 있었는지",
    "상대방 감정을 회복하기 위한 후속 행동이 있었는지"
  ];

  return {
    aiSummary: `${input.title}은 ${input.category} 영역에서 생긴 갈등으로, 양측의 기대와 해석 차이가 핵심입니다.`,
    aiPlaintiffSummary: `${input.plaintiffStatement.slice(0, 74)}${input.plaintiffStatement.length > 74 ? "..." : ""}`,
    aiDefendantSummary: `${input.defendantStatement.slice(0, 74)}${input.defendantStatement.length > 74 ? "..." : ""}`,
    aiIssues: JSON.stringify(issues),
    aiWarning: JSON.stringify({
      hasPersonalInfo: false,
      hasAbuse: false,
      message: "개인정보와 과격한 표현은 발견되지 않았습니다."
    })
  };
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key];
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topEntry(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
}

function buildVerdict(caseItem, votes) {
  const verdictCounts = countBy(votes, "verdict");
  const sentenceCounts = countBy(votes, "sentenceLabel");
  const [finalVerdict] = topEntry(verdictCounts);
  const [sentenceLabel] = topEntry(sentenceCounts);
  const sentenceMonths = sentences.find(([label]) => label === sentenceLabel)?.[1] ?? 0;
  const voteSummary = {
    total: votes.length,
    verdictCounts,
    sentenceCounts
  };

  return {
    finalVerdict,
    sentenceMonths,
    sentenceLabel,
    voteSummary: JSON.stringify(voteSummary),
    aiVerdictText: `배심원 ${votes.length}명의 판단을 종합한 결과, 이 사건은 '${finalVerdict}'로 판결합니다. ${caseItem.category} 갈등의 핵심은 약속의 무게와 사후 설명의 충분성입니다. 최종 형량은 ${sentenceLabel}이며, 당사자는 상대방의 감정 회복을 위한 구체적인 행동을 제시해야 합니다.`,
    reductionMissions: JSON.stringify([
      { title: "사과문 작성", reduction: "-3개월" },
      { title: "데이트 코스 준비", reduction: "-6개월" },
      { title: "손편지 작성", reduction: "-1년" },
      { title: "상대방 용서 승인", reduction: "집행유예" }
    ])
  };
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.report.deleteMany();
  await prisma.block.deleteMany();
  await prisma.sentenceRecord.deleteMany();
  await prisma.verdict.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.case.deleteMany();
  await prisma.couple.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const mainUsers = await Promise.all([
    prisma.user.create({ data: { loginId: "minji", inviteCode: mainInviteCodes[0], passwordHash, nickname: "민지", avatar: avatars[0] } }),
    prisma.user.create({ data: { loginId: "joonsu", inviteCode: mainInviteCodes[1], passwordHash, nickname: "준수", avatar: avatars[1] } }),
    prisma.user.create({ data: { loginId: "seoyeon", inviteCode: mainInviteCodes[2], passwordHash, nickname: "서연", avatar: avatars[2] } }),
    prisma.user.create({ data: { loginId: "taehyun", inviteCode: mainInviteCodes[3], passwordHash, nickname: "태현", avatar: avatars[3] } })
  ]);

  const jurors = [];
  for (let i = 1; i <= 100; i += 1) {
    jurors.push(
      await prisma.user.create({
        data: {
          loginId: `juror${String(i).padStart(3, "0")}`,
          inviteCode: `JR${String(i).padStart(4, "0")}`,
          passwordHash,
          nickname: `배심원${i}`,
          avatar: avatars[i % avatars.length]
        }
      })
    );
  }

  const couple = await prisma.couple.create({
    data: {
      userAId: mainUsers[0].id,
      userBId: mainUsers[1].id,
      inviteCode: "AB12CD",
      status: "CONNECTED"
    }
  });

  const now = Date.now();
  const caseInputs = [
    {
      title: "생일 까먹은 사건",
      category: "기념일/이벤트",
      plaintiffStatement: "작년에도 생일을 대충 넘어갔는데 올해는 아예 까먹었습니다. 하루 종일 연락을 기다렸고, 밤늦게 말하니 그제서야 미안하다고 했습니다.",
      defendantStatement: "회사 마감 때문에 정신이 없었습니다. 일부러 무시한 건 아니고 퇴근 후 바로 케이크를 사러 갔지만 이미 마음이 상한 뒤였습니다.",
      status: "VERDICT_DONE",
      deadlineOffset: -2,
      votes: 80
    },
    {
      title: "읽씹 12시간 사건",
      category: "연락/소통",
      plaintiffStatement: "중요한 이야기를 보냈는데 읽고 12시간 동안 답이 없었습니다. SNS에는 계속 접속해 있어서 더 서운했습니다.",
      defendantStatement: "답장을 어떻게 해야 할지 고민하다가 시간이 지났습니다. SNS는 습관적으로 본 것이고 일부러 피한 건 아닙니다.",
      status: "VERDICT_DONE",
      deadlineOffset: -1,
      votes: 100
    },
    {
      title: "전애인 인스타 좋아요 사건",
      category: "SNS/온라인",
      plaintiffStatement: "전애인 사진에 좋아요를 누른 걸 봤습니다. 단순 실수라고 하기에는 최근 게시물이라 납득하기 어렵습니다.",
      defendantStatement: "피드에 떠서 별생각 없이 눌렀습니다. 연락하거나 마음이 남은 것은 아니고 바로 취소했습니다.",
      status: "OPEN",
      deadlineOffset: 2,
      votes: 67
    },
    {
      title: "칫솔 뚜껑 안 닫는 사건",
      category: "생활/습관",
      plaintiffStatement: "같이 쓰는 욕실에서 매번 칫솔 뚜껑을 열어둡니다. 여러 번 말했는데도 고쳐지지 않아 위생 문제가 걱정됩니다.",
      defendantStatement: "급하게 출근하다 보니 놓친 적이 많았습니다. 습관 문제라 인정하고 이제는 칫솔 케이스를 바꾸려고 합니다.",
      status: "OPEN",
      deadlineOffset: 3,
      votes: 42
    },
    {
      title: "데이트 비용 반반 사건",
      category: "돈 문제",
      plaintiffStatement: "월급 차이가 큰데도 모든 비용을 정확히 반반으로만 계산합니다. 상황을 고려하지 않는 느낌이 듭니다.",
      defendantStatement: "서로 독립적인 관계라고 생각해서 반반이 공평하다고 봤습니다. 부담이 됐다면 먼저 말해줬으면 좋았을 것 같습니다.",
      status: "OPEN",
      deadlineOffset: 5,
      votes: 25
    },
    {
      title: "약속 시간 2시간 늦은 사건",
      category: "약속",
      plaintiffStatement: "주말 데이트 약속에 2시간 늦었습니다. 기다리는 동안 연락도 뜸해서 혼자 약속 장소에 방치된 기분이었습니다.",
      defendantStatement: "대중교통 사고와 배터리 방전이 겹쳤습니다. 늦은 것은 잘못이지만 일부러 연락을 피한 것은 아닙니다.",
      status: "OPEN",
      deadlineOffset: 1,
      votes: 12
    }
  ];

  for (let caseIndex = 0; caseIndex < caseInputs.length; caseIndex += 1) {
    const input = caseInputs[caseIndex];
    const ai = summaryFor(input);
    const created = await prisma.case.create({
      data: {
        plaintiffId: mainUsers[caseIndex % 2].id,
        defendantId: mainUsers[(caseIndex + 1) % 2].id,
        coupleId: couple.id,
        title: input.title,
        category: input.category,
        plaintiffStatement: input.plaintiffStatement,
        defendantStatement: input.defendantStatement,
        voteDeadlineAt: new Date(now + input.deadlineOffset * 24 * 60 * 60 * 1000),
        status: input.status,
        ...ai
      }
    });

    const voteData = [];
    for (let i = 0; i < input.votes; i += 1) {
      const sentence = sentences[(i + caseIndex) % sentences.length];
      voteData.push({
        caseId: created.id,
        userId: jurors[i].id,
        verdict: verdictOptions[(i + caseIndex + (i % 3 === 0 ? 0 : 1)) % verdictOptions.length],
        sentenceLabel: sentence[0],
        sentenceMonths: sentence[1]
      });
    }
    await prisma.vote.createMany({ data: voteData });

    if (input.status === "VERDICT_DONE") {
      const verdictData = buildVerdict(created, voteData);
      const verdict = await prisma.verdict.create({
        data: {
          caseId: created.id,
          ...verdictData,
          reflectedToProfile: true
        }
      });
      await prisma.sentenceRecord.create({
        data: {
          userId: created.defendantId || created.plaintiffId,
          caseId: created.id,
          title: created.title,
          sentenceMonths: verdict.sentenceMonths,
          sentenceLabel: verdict.sentenceLabel,
          remainingMonths: verdict.sentenceMonths >= 9999 ? 9999 : verdict.sentenceMonths,
          status: verdict.sentenceMonths === 0 ? "SUSPENDED" : "ACTIVE"
        }
      });
    }
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: mainUsers[0].id,
        type: "CASE_CLOSED",
        title: "사건 투표가 마감됐어요",
        body: "읽씹 12시간 사건의 최종 판결이 준비됐습니다."
      },
      {
        userId: mainUsers[0].id,
        type: "NEW_VOTE",
        title: "새 배심원이 참여했어요",
        body: "전애인 인스타 좋아요 사건에 배심원이 새로 참여했습니다."
      },
      {
        userId: mainUsers[1].id,
        type: "BADGE",
        title: "배지를 획득했어요",
        body: "정의로운 배심원 배지가 프로필에 추가됐습니다."
      },
      {
        userId: mainUsers[0].id,
        type: "VERDICT_REFLECTED",
        title: "판결 결과가 프로필에 반영됐어요",
        body: "생일 까먹은 사건의 형량 기록이 저장됐습니다.",
        readAt: new Date()
      }
    ]
  });

  const firstCase = await prisma.case.findFirst({ where: { title: "전애인 인스타 좋아요 사건" } });
  if (firstCase) {
    await prisma.report.create({
      data: {
        reporterId: mainUsers[2].id,
        caseId: firstCase.id,
        targetUserId: firstCase.plaintiffId,
        reason: "개인정보 노출",
        detail: "SNS 계정이 특정될 수 있는 표현이 있는지 확인이 필요합니다."
      }
    });
  }

  console.log("Seed complete. Demo login: minji / demo1234");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
