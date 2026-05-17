import { generateVerdict } from "@/lib/ai";
import { BADGES } from "@/lib/constants";
import { ensureUserInviteCode } from "@/lib/invites";
import { getPrisma } from "@/lib/prisma";
import { safeJson } from "@/lib/format";

export async function closeCaseIfNeeded(caseId: string) {
  const db = getPrisma();
  const caseItem = await db.case.findUnique({
    where: { id: caseId },
    include: { _count: { select: { votes: true } } }
  });

  if (!caseItem || caseItem.status !== "OPEN") return caseItem;

  const shouldClose =
    caseItem.voteDeadlineAt.getTime() <= Date.now() || caseItem._count.votes >= caseItem.maxJurors;

  if (!shouldClose) return caseItem;

  const closed = await db.case.update({
    where: { id: caseId },
    data: { status: "CLOSED" },
    include: { _count: { select: { votes: true } } }
  });

  await db.notification.create({
    data: {
      userId: closed.plaintiffId,
      type: "CASE_CLOSED",
      title: "사건 투표가 마감됐어요",
      body: `${closed.title}의 최종 판결을 확인할 수 있습니다.`
    }
  });

  return closed;
}

export async function ensureVerdictForCase(caseId: string) {
  const db = getPrisma();
  await closeCaseIfNeeded(caseId);

  const existing = await db.verdict.findUnique({ where: { caseId } });
  if (existing) return existing;

  const caseItem = await db.case.findUnique({
    where: { id: caseId },
    include: { votes: true, _count: { select: { votes: true } } }
  });

  if (!caseItem || caseItem.status === "HIDDEN") return null;

  const ended =
    caseItem.status !== "OPEN" ||
    caseItem.voteDeadlineAt.getTime() <= Date.now() ||
    caseItem._count.votes >= caseItem.maxJurors;

  if (!ended) return null;

  const aiVerdict = generateVerdict(caseItem, caseItem.votes);
  const verdict = await db.verdict.create({
    data: {
      caseId,
      finalVerdict: aiVerdict.finalVerdict,
      sentenceMonths: aiVerdict.sentenceMonths,
      sentenceLabel: aiVerdict.sentenceLabel,
      voteSummary: JSON.stringify(aiVerdict.voteSummary),
      aiVerdictText: aiVerdict.aiVerdictText,
      reductionMissions: JSON.stringify(aiVerdict.reductionMissions)
    }
  });

  await db.case.update({
    where: { id: caseId },
    data: { status: "VERDICT_DONE" }
  });

  return verdict;
}

export async function getUserCouple(userId: string) {
  return getPrisma().couple.findFirst({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }]
    },
    include: {
      userA: { select: { id: true, nickname: true, avatar: true } },
      userB: { select: { id: true, nickname: true, avatar: true } }
    }
  });
}

export async function getUserInviteCode(userId: string) {
  return ensureUserInviteCode(getPrisma(), userId);
}

export async function getJuryStats(userId: string) {
  const db = getPrisma();
  const votes = await db.vote.findMany({ where: { userId } });
  const finiteSentences = votes.filter((vote) => vote.sentenceMonths < 9999);
  const averageMonths = finiteSentences.length
    ? finiteSentences.reduce((sum, vote) => sum + vote.sentenceMonths, 0) / finiteSentences.length
    : 0;
  const lifeCount = votes.filter((vote) => vote.sentenceLabel === "무기징역").length;
  const reconciliationCount = votes.filter((vote) => vote.verdict === "화해 권고").length;

  const badges = [
    votes.length >= 1 ? BADGES[0] : null,
    reconciliationCount >= 3 ? BADGES[1] : null,
    votes.length >= 10 ? BADGES[2] : null,
    votes.length >= 7 ? BADGES[3] : null,
    lifeCount >= 2 ? BADGES[4] : null,
    reconciliationCount >= 1 ? BADGES[5] : null
  ].filter(Boolean) as string[];

  const verdictCounts = votes.reduce<Record<string, number>>((acc, vote) => {
    acc[vote.verdict] = (acc[vote.verdict] || 0) + 1;
    return acc;
  }, {});
  const tone = Object.entries(verdictCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "균형형";

  return {
    totalVotes: votes.length,
    averageMonths,
    badges,
    tone
  };
}

export async function listPublicCases(userId: string) {
  const db = getPrisma();
  await db.case.updateMany({
    where: {
      status: "OPEN",
      voteDeadlineAt: { lte: new Date() }
    },
    data: { status: "CLOSED" }
  });

  const blockedIds = (await db.block.findMany({ where: { blockerId: userId } })).map(
    (block) => block.blockedUserId
  );

  return db.case.findMany({
    where: {
      status: { in: ["OPEN", "CLOSED", "VERDICT_DONE"] },
      adminHidden: false,
      ...(blockedIds.length
        ? {
            NOT: [{ plaintiffId: { in: blockedIds } }, { defendantId: { in: blockedIds } }]
          }
        : {})
    },
    include: {
      plaintiff: { select: { id: true, nickname: true, avatar: true } },
      verdict: { select: { finalVerdict: true } },
      _count: { select: { votes: true } }
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });
}

export async function getCaseDetail(caseId: string, userId: string) {
  await closeCaseIfNeeded(caseId);
  const db = getPrisma();

  const caseItem = await db.case.findUnique({
    where: { id: caseId },
    include: {
      plaintiff: { select: { id: true, nickname: true, avatar: true } },
      defendant: { select: { id: true, nickname: true, avatar: true } },
      votes: { where: { userId }, take: 1 },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: { select: { id: true, nickname: true, avatar: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            take: 20,
            include: { user: { select: { id: true, nickname: true, avatar: true } } }
          }
        }
      },
      _count: { select: { votes: true, reports: true, comments: true } }
    }
  });

  if (!caseItem || caseItem.status === "HIDDEN" || caseItem.adminHidden) return null;
  if (
    caseItem.status === "PENDING_DEFENDANT" &&
    caseItem.plaintiffId !== userId &&
    caseItem.defendantId !== userId
  ) {
    return null;
  }

  const updatedViews = await db.case.update({
    where: { id: caseId },
    data: { viewCount: { increment: 1 } },
    select: { viewCount: true }
  });

  return {
    ...caseItem,
    viewCount: updatedViews.viewCount,
    aiIssuesList: safeJson<string[]>(caseItem.aiIssues, []),
    aiWarningData: safeJson<{ hasPersonalInfo: boolean; hasAbuse: boolean; message: string }>(
      caseItem.aiWarning,
      { hasPersonalInfo: false, hasAbuse: false, message: "경고 없음" }
    ),
    myVote: caseItem.votes[0] || null,
    isVoteClosed:
      caseItem.status !== "OPEN" ||
      caseItem.voteDeadlineAt.getTime() <= Date.now() ||
      caseItem._count.votes >= caseItem.maxJurors
  };
}

export async function getVerdictDetail(caseId: string) {
  const verdict = await ensureVerdictForCase(caseId);
  if (!verdict) return null;

  const caseItem = await getPrisma().case.findUnique({
    where: { id: caseId },
    include: {
      plaintiff: { select: { id: true, nickname: true, avatar: true } },
      defendant: { select: { id: true, nickname: true, avatar: true } },
      votes: true,
      _count: { select: { votes: true } }
    }
  });

  if (!caseItem || caseItem.status === "HIDDEN" || caseItem.adminHidden) return null;

  return {
    caseItem,
    verdict,
    voteSummary: safeJson<{
      total: number;
      verdictCounts: Record<string, number>;
      sentenceCounts: Record<string, number>;
    }>(verdict.voteSummary, { total: 0, verdictCounts: {}, sentenceCounts: {} }),
    reductionMissions: safeJson<{ title: string; reduction: string }[]>(verdict.reductionMissions, [])
  };
}

export async function getProfile(userId: string) {
  const db = getPrisma();
  const [user, stats, records] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, loginId: true, nickname: true, avatar: true, createdAt: true }
    }),
    getJuryStats(userId),
    db.sentenceRecord.findMany({
      where: { userId },
      include: { case: { select: { title: true } } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return { user, stats, records };
}

export async function getActivity(userId: string) {
  const db = getPrisma();
  const [votes, createdCases, stats] = await Promise.all([
    db.vote.findMany({
      where: { userId },
      include: {
        case: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            caseImages: true,
            verdict: { select: { finalVerdict: true, sentenceLabel: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    db.case.findMany({
      where: { plaintiffId: userId, status: { not: "HIDDEN" }, adminHidden: false },
      include: { _count: { select: { votes: true } } },
      orderBy: { createdAt: "desc" }
    }),
    getJuryStats(userId)
  ]);

  return {
    votes,
    createdCases,
    stats,
    likes: votes.length * 3 + createdCases.length * 5,
    streakDays: Math.min(7, Math.max(1, votes.length || createdCases.length))
  };
}

export async function listNotifications(userId: string) {
  return getPrisma().notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAdminData() {
  const db = getPrisma();
  const [reports, cases] = await Promise.all([
    db.report.findMany({
      include: {
        reporter: { select: { nickname: true, avatar: true } },
        targetUser: { select: { nickname: true, avatar: true } },
        case: { select: { id: true, title: true, status: true, plaintiffId: true } }
      },
      orderBy: { createdAt: "desc" }
    }),
    db.case.findMany({
      where: { OR: [{ adminHidden: true }, { status: "HIDDEN" }] },
      orderBy: { updatedAt: "desc" },
      take: 20
    })
  ]);

  return { reports, cases };
}
