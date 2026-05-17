-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "couple_court";

-- CreateTable
CREATE TABLE "couple_court"."User" (
    "id" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_court"."Couple" (
    "id" TEXT NOT NULL,
    "userAId" TEXT NOT NULL,
    "userBId" TEXT,
    "inviteCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Couple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_court"."Case" (
    "id" TEXT NOT NULL,
    "plaintiffId" TEXT NOT NULL,
    "defendantId" TEXT,
    "coupleId" TEXT,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "plaintiffStatement" TEXT NOT NULL,
    "defendantStatement" TEXT NOT NULL,
    "aiSummary" TEXT NOT NULL,
    "aiPlaintiffSummary" TEXT NOT NULL,
    "aiDefendantSummary" TEXT NOT NULL,
    "aiIssues" TEXT NOT NULL,
    "aiWarning" TEXT NOT NULL,
    "voteDeadlineAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "maxJurors" INTEGER NOT NULL DEFAULT 100,
    "adminHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_court"."Vote" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "sentenceMonths" INTEGER NOT NULL,
    "sentenceLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_court"."Verdict" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "finalVerdict" TEXT NOT NULL,
    "sentenceMonths" INTEGER NOT NULL,
    "sentenceLabel" TEXT NOT NULL,
    "voteSummary" TEXT NOT NULL,
    "aiVerdictText" TEXT NOT NULL,
    "reductionMissions" TEXT NOT NULL,
    "reflectedToProfile" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verdict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_court"."SentenceRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sentenceMonths" INTEGER NOT NULL,
    "sentenceLabel" TEXT NOT NULL,
    "remainingMonths" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentenceRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_court"."Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "caseId" TEXT,
    "targetUserId" TEXT,
    "reason" TEXT NOT NULL,
    "detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_court"."Block" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_court"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_loginId_key" ON "couple_court"."User"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "Couple_userAId_key" ON "couple_court"."Couple"("userAId");

-- CreateIndex
CREATE UNIQUE INDEX "Couple_userBId_key" ON "couple_court"."Couple"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "Couple_inviteCode_key" ON "couple_court"."Couple"("inviteCode");

-- CreateIndex
CREATE INDEX "Case_status_voteDeadlineAt_idx" ON "couple_court"."Case"("status", "voteDeadlineAt");

-- CreateIndex
CREATE INDEX "Case_plaintiffId_idx" ON "couple_court"."Case"("plaintiffId");

-- CreateIndex
CREATE INDEX "Vote_userId_idx" ON "couple_court"."Vote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_caseId_userId_key" ON "couple_court"."Vote"("caseId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Verdict_caseId_key" ON "couple_court"."Verdict"("caseId");

-- CreateIndex
CREATE INDEX "SentenceRecord_userId_createdAt_idx" ON "couple_court"."SentenceRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "couple_court"."Report"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Block_blockerId_blockedUserId_key" ON "couple_court"."Block"("blockerId", "blockedUserId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_createdAt_idx" ON "couple_court"."Notification"("userId", "readAt", "createdAt");

-- AddForeignKey
ALTER TABLE "couple_court"."Couple" ADD CONSTRAINT "Couple_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "couple_court"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Couple" ADD CONSTRAINT "Couple_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "couple_court"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Case" ADD CONSTRAINT "Case_plaintiffId_fkey" FOREIGN KEY ("plaintiffId") REFERENCES "couple_court"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Case" ADD CONSTRAINT "Case_defendantId_fkey" FOREIGN KEY ("defendantId") REFERENCES "couple_court"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Case" ADD CONSTRAINT "Case_coupleId_fkey" FOREIGN KEY ("coupleId") REFERENCES "couple_court"."Couple"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Vote" ADD CONSTRAINT "Vote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "couple_court"."Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Vote" ADD CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "couple_court"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Verdict" ADD CONSTRAINT "Verdict_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "couple_court"."Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."SentenceRecord" ADD CONSTRAINT "SentenceRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "couple_court"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."SentenceRecord" ADD CONSTRAINT "SentenceRecord_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "couple_court"."Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "couple_court"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Report" ADD CONSTRAINT "Report_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "couple_court"."Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Report" ADD CONSTRAINT "Report_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "couple_court"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Block" ADD CONSTRAINT "Block_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "couple_court"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Block" ADD CONSTRAINT "Block_blockedUserId_fkey" FOREIGN KEY ("blockedUserId") REFERENCES "couple_court"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_court"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "couple_court"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
