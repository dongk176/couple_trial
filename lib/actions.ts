"use server";

import { randomUUID } from "node:crypto";
import { createHash, createHmac } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateCaseSummary } from "@/lib/ai";
import {
  AVATAR_OPTIONS,
  CASE_COMMENT_MAX_LENGTH,
  CASE_CATEGORIES,
  JURY_COMMENT_MAX_LENGTH,
  NO_SENTENCE_LABEL,
  NO_SENTENCE_VERDICTS,
  SENTENCE_OPTIONS,
  VERDICT_OPTIONS
} from "@/lib/constants";
import { clearSessionCookie, requireUser, setSessionCookie } from "@/lib/auth";
import { createUniqueInviteCode, ensureUserInviteCode } from "@/lib/invites";
import { getPrisma } from "@/lib/prisma";
import { closeCaseIfNeeded, ensureVerdictForCase } from "@/lib/services";

function field(formData: FormData, name: string) {
  return String(formData.get(name) || "").trim();
}

export type CaseCommentActionState = {
  ok: boolean;
  message: string;
  submittedAt: number;
};

function adminAllowed(secret: string) {
  const adminSecret = process.env.ADMIN_SECRET || process.env.COUPLE_COURT_ADMIN_SECRET || process.env.NEXTAUTH_SECRET;
  return Boolean(adminSecret && secret === adminSecret);
}

const CASE_IMAGE_LIMIT = 3;
const CASE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const PROFILE_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
const CASE_VOTE_DURATION_HOURS = [1, 6, 12, 24] as const;
const CASE_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif"
};
const SIGNUP_GENDERS = ["여성", "남성", "기타"] as const;

class UploadStorageError extends Error {
  constructor() {
    super("UPLOAD_STORAGE_NOT_CONFIGURED");
  }
}

function getS3Config() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL || process.env.AWS_S3_PUBLIC_URL;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) return null;

  return {
    region,
    bucket,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    publicBaseUrl: publicBaseUrl?.replace(/\/+$/, "")
  };
}

function hashHex(input: Buffer | string) {
  return createHash("sha256").update(input).digest("hex");
}

function hmac(key: Buffer | string, value: string) {
  return createHmac("sha256", key).update(value).digest();
}

function encodeS3Key(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

async function uploadToS3(bytes: Buffer, contentType: string, folder: "cases" | "profiles", extension: string) {
  const config = getS3Config();
  if (!config) return null;

  const key = `couple-court/${folder}/${Date.now()}-${randomUUID()}.${extension}`;
  const encodedKey = encodeS3Key(key);
  const usePathStyle = config.bucket.includes(".");
  const host = usePathStyle ? `s3.${config.region}.amazonaws.com` : `${config.bucket}.s3.${config.region}.amazonaws.com`;
  const canonicalUri = usePathStyle ? `/${encodeURIComponent(config.bucket)}/${encodedKey}` : `/${encodedKey}`;
  const url = `https://${host}${canonicalUri}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = hashHex(bytes);
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const headersToSign: Record<string, string> = {
    "content-type": contentType,
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate
  };

  if (config.sessionToken) {
    headersToSign["x-amz-security-token"] = config.sessionToken;
  }

  const signedHeaderNames = Object.keys(headersToSign).sort();
  const canonicalHeaders = signedHeaderNames.map((name) => `${name}:${headersToSign[name]}\n`).join("");
  const signedHeaders = signedHeaderNames.join(";");
  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hashHex(canonicalRequest)].join("\n");
  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, config.region);
  const serviceKey = hmac(regionKey, "s3");
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const requestHeaders: Record<string, string> = {
    "content-type": contentType,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    authorization
  };

  if (config.sessionToken) {
    requestHeaders["x-amz-security-token"] = config.sessionToken;
  }

  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const response = await fetch(url, {
    method: "PUT",
    headers: requestHeaders,
    body
  });

  if (!response.ok) {
    throw new Error(`S3_UPLOAD_FAILED_${response.status}`);
  }

  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl}/${encodedKey}`;
  }

  return usePathStyle ? `https://${host}/${encodeURIComponent(config.bucket)}/${encodedKey}` : `https://${host}/${encodedKey}`;
}

async function saveUploadedImage(file: File, folder: "cases" | "profiles", extension: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const s3Url = await uploadToS3(bytes, file.type, folder, extension);
  if (s3Url) return s3Url;

  if (process.env.NODE_ENV === "production" || process.env.VERCEL === "1") {
    throw new UploadStorageError();
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  await mkdir(uploadDir, { recursive: true });
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadDir, fileName), bytes);
  return `/uploads/${folder}/${fileName}`;
}

function caseImageFiles(formData: FormData) {
  return formData
    .getAll("caseImages")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function singleImageFile(formData: FormData, name: string) {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

async function saveCaseImages(files: File[]) {
  if (files.length > CASE_IMAGE_LIMIT) {
    redirect("/cases/new?error=imageCount");
  }

  for (const file of files) {
    if (!CASE_IMAGE_TYPES[file.type]) {
      redirect("/cases/new?error=imageType");
    }
    if (file.size > CASE_IMAGE_MAX_BYTES) {
      redirect("/cases/new?error=imageSize");
    }
  }

  if (!files.length) return [];

  const urls: string[] = [];
  for (const file of files) {
    const extension = CASE_IMAGE_TYPES[file.type];
    try {
      urls.push(await saveUploadedImage(file, "cases", extension));
    } catch (error) {
      if (error instanceof UploadStorageError) {
        redirect("/cases/new?error=imageUpload");
      }
      throw error;
    }
  }

  return urls;
}

async function saveProfileImage(file: File | null) {
  if (!file) return null;

  const extension = CASE_IMAGE_TYPES[file.type];
  if (!extension || file.size > PROFILE_IMAGE_MAX_BYTES) {
    redirect("/signup?error=avatar");
  }

  try {
    return await saveUploadedImage(file, "profiles", extension);
  } catch (error) {
    if (error instanceof UploadStorageError) {
      redirect("/signup?error=upload");
    }
    throw error;
  }
}

export async function signup(formData: FormData) {
  const loginId = field(formData, "loginId").toLowerCase();
  const password = field(formData, "password");
  const nickname = field(formData, "nickname");
  const selectedAvatar = field(formData, "avatar") || AVATAR_OPTIONS[0];
  const realName = field(formData, "realName");
  const gender = field(formData, "gender");
  const birthday = field(formData, "birthday");
  const birthYearValue = field(formData, "birthYear");
  const birthYear = Number(birthYearValue);
  const phoneNumber = field(formData, "phoneNumber");
  const currentYear = new Date().getFullYear();

  if (
    !loginId ||
    !password ||
    !nickname ||
    !realName ||
    !gender ||
    !birthday ||
    !birthYearValue ||
    !phoneNumber
  ) {
    redirect("/signup?error=required");
  }

  if (!SIGNUP_GENDERS.includes(gender as (typeof SIGNUP_GENDERS)[number]) || !Number.isInteger(birthYear) || birthYear < 1900 || birthYear > currentYear) {
    redirect("/signup?error=required");
  }

  if (!AVATAR_OPTIONS.includes(selectedAvatar)) {
    redirect("/signup?error=avatar");
  }

  const db = getPrisma();
  const existing = await db.user.findUnique({ where: { loginId } });
  if (existing) {
    redirect("/signup?error=duplicate");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const inviteCode = await createUniqueInviteCode(db);
  const uploadedAvatar = await saveProfileImage(singleImageFile(formData, "avatarUpload"));
  const avatar = uploadedAvatar || selectedAvatar;
  const user = await db.user.create({
    data: { loginId, inviteCode, passwordHash, nickname, avatar, realName, gender, birthday, birthYear, phoneNumber }
  });

  await setSessionCookie(user.id);
  redirect("/home");
}

export async function login(formData: FormData) {
  const loginId = field(formData, "loginId").toLowerCase();
  const password = field(formData, "password");
  const user = await getPrisma().user.findUnique({ where: { loginId } });

  if (!user) {
    redirect("/login?error=invalid");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    redirect("/login?error=invalid");
  }

  await setSessionCookie(user.id);
  redirect("/home");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/");
}

export async function createCoupleInvite() {
  const user = await requireUser();
  const db = getPrisma();
  const existing = await db.couple.findFirst({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] }
  });

  if (existing) {
    redirect("/couple");
  }

  await ensureUserInviteCode(db, user.id);
  revalidatePath("/couple");
  redirect("/couple");
}

export async function connectCouple(formData: FormData) {
  const user = await requireUser();
  const rawInput = field(formData, "inviteCodeOrLoginId") || field(formData, "inviteCode");
  const code = rawInput.replace(/\s+/g, "").toUpperCase();
  const loginId = rawInput.toLowerCase();
  const db = getPrisma();

  if (!rawInput) {
    redirect("/couple?error=invalid");
  }

  const myCouple = await db.couple.findFirst({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] }
  });
  if (myCouple?.status === "CONNECTED") {
    redirect("/couple?error=already");
  }

  const targetUserByCode = /^[A-Z0-9]{6}$/.test(code)
    ? await db.user.findUnique({ where: { inviteCode: code } })
    : null;
  const legacyInvite = targetUserByCode
    ? null
    : /^[A-Z0-9]{6}$/.test(code)
      ? await db.couple.findUnique({
          where: { inviteCode: code },
          include: { userA: { select: { id: true, loginId: true } } }
        })
      : null;
  const targetUserByLogin = targetUserByCode || legacyInvite ? null : await db.user.findUnique({ where: { loginId } });
  const targetUser = targetUserByCode || legacyInvite?.userA || targetUserByLogin;

  if (targetUser?.id === user.id) {
    redirect("/couple?error=selfInvite");
  }

  if (!targetUser) {
    redirect("/couple?error=invalid");
  }

  const targetCouple = await db.couple.findFirst({
    where: { OR: [{ userAId: targetUser.id }, { userBId: targetUser.id }] }
  });

  if (targetCouple?.status === "CONNECTED") {
    redirect("/couple?error=targetConnected");
  }

  if (myCouple?.status === "PENDING" && myCouple.id !== targetCouple?.id) {
    await db.couple.delete({ where: { id: myCouple.id } });
  }

  const targetInviteCode = await ensureUserInviteCode(db, targetUser.id);
  if (targetCouple?.status === "PENDING") {
    await db.couple.update({
      where: { id: targetCouple.id },
      data: { inviteCode: targetInviteCode, userBId: user.id, status: "CONNECTED" }
    });
  } else {
    await db.couple.create({
      data: {
        userAId: targetUser.id,
        userBId: user.id,
        inviteCode: targetInviteCode,
        status: "CONNECTED"
      }
    });
  }

  await db.notification.createMany({
    data: [
      {
        userId: targetUser.id,
        type: "COUPLE_CONNECTED",
        title: "커플 법정이 열렸어요",
        body: `${user.nickname}님과 커플 연결이 완료됐습니다.`
      },
      {
        userId: user.id,
        type: "COUPLE_CONNECTED",
        title: "커플 법정이 열렸어요",
        body: "상대방 초대코드로 커플 연결이 완료됐습니다."
      }
    ]
  });

  revalidatePath("/couple");
  redirect("/couple");
}

export async function createCase(formData: FormData) {
  const user = await requireUser();
  const db = getPrisma();
  const couple = await db.couple.findFirst({
    where: {
      status: "CONNECTED",
      OR: [{ userAId: user.id }, { userBId: user.id }]
    }
  });

  if (!couple) {
    redirect("/couple?from=case");
  }

  const title = field(formData, "title");
  const category = field(formData, "category");
  const plaintiffStatement = field(formData, "plaintiffStatement");
  const responseMode = field(formData, "responseMode");
  const directResponse = responseMode === "direct";
  const requestResponse = responseMode === "request";
  const defendantStatement = field(formData, "defendantStatement");
  const voteDurationHours = Number(field(formData, "voteDurationHours"));

  if (!title || !category || !plaintiffStatement || (directResponse && !defendantStatement)) {
    redirect("/cases/new?error=required");
  }

  if (!directResponse && !requestResponse) {
    redirect("/cases/new?error=responseMode");
  }

  if (!CASE_CATEGORIES.includes(category)) {
    redirect("/cases/new?error=category");
  }

  if (!CASE_VOTE_DURATION_HOURS.includes(voteDurationHours as (typeof CASE_VOTE_DURATION_HOURS)[number])) {
    redirect("/cases/new?error=deadline");
  }
  const voteDeadlineAt = new Date(Date.now() + voteDurationHours * 60 * 60 * 1000);

  const defendantId = couple.userAId === user.id ? couple.userBId : couple.userAId;
  if (!defendantId) {
    redirect("/couple?from=case");
  }

  const imageUrls = await saveCaseImages(caseImageFiles(formData));

  const summary = generateCaseSummary({
    title,
    category,
    plaintiffStatement,
    defendantStatement: directResponse ? defendantStatement : null
  });
  const created = await db.case.create({
    data: {
      plaintiffId: user.id,
      defendantId,
      coupleId: couple.id,
      title,
      category,
      plaintiffStatement,
      defendantStatement: directResponse ? defendantStatement : null,
      defendantResponseSource: directResponse ? "PLAINTIFF" : null,
      caseImages: JSON.stringify(imageUrls),
      aiSummary: summary.aiSummary,
      aiPlaintiffSummary: summary.aiPlaintiffSummary,
      aiDefendantSummary: summary.aiDefendantSummary,
      aiIssues: JSON.stringify(summary.aiIssues),
      aiWarning: JSON.stringify(summary.aiWarning),
      voteDeadlineAt,
      status: directResponse ? "OPEN" : "PENDING_DEFENDANT",
      responseRequestedAt: requestResponse ? new Date() : null,
      responseSubmittedAt: directResponse ? new Date() : null
    }
  });

  if (requestResponse) {
    await db.notification.create({
      data: {
        userId: defendantId,
        type: "DEFENDANT_RESPONSE_REQUESTED",
        title: "피고 답변 요청이 도착했어요",
        body: `${user.nickname}님이 ${title} 사건에 답변을 요청했습니다.`,
        actionUrl: `/cases/${created.id}/respond`
      }
    });
  } else {
    await db.notification.create({
      data: {
        userId: defendantId,
        type: "CASE_CREATED",
        title: "새 공개 사건이 등록됐어요",
        body: `${title} 사건이 공개 재판에 올라갔습니다.`,
        actionUrl: `/cases/${created.id}`
      }
    });
  }

  revalidatePath("/home");
  revalidatePath("/notifications");
  redirect(
    directResponse
      ? `/cases/${created.id}`
      : `/home?caseRequested=1&caseTitle=${encodeURIComponent(title)}`
  );
}

export async function submitDefendantResponse(formData: FormData) {
  const user = await requireUser();
  const caseId = field(formData, "caseId");
  const defendantStatement = field(formData, "defendantStatement");

  if (!caseId || !defendantStatement) {
    redirect(caseId ? `/cases/${caseId}/respond?error=required` : "/home");
  }

  const db = getPrisma();
  const caseItem = await db.case.findUnique({
    where: { id: caseId },
    include: { plaintiff: { select: { nickname: true } } }
  });

  if (!caseItem || caseItem.adminHidden || caseItem.status === "HIDDEN") {
    redirect("/home");
  }

  if (caseItem.defendantId !== user.id) {
    redirect(`/cases/${caseId}/respond?error=forbidden`);
  }

  if (caseItem.status !== "PENDING_DEFENDANT") {
    redirect(`/cases/${caseId}/respond?error=closed`);
  }

  const summary = generateCaseSummary({
    title: caseItem.title,
    category: caseItem.category,
    plaintiffStatement: caseItem.plaintiffStatement,
    defendantStatement
  });

  await db.case.update({
    where: { id: caseId },
    data: {
      defendantStatement,
      defendantResponseSource: "DEFENDANT",
      aiSummary: summary.aiSummary,
      aiPlaintiffSummary: summary.aiPlaintiffSummary,
      aiDefendantSummary: summary.aiDefendantSummary,
      aiIssues: JSON.stringify(summary.aiIssues),
      aiWarning: JSON.stringify(summary.aiWarning),
      voteDeadlineAt: new Date(
        Date.now() +
          Math.max(
            60 * 60 * 1000,
            caseItem.voteDeadlineAt.getTime() -
              (caseItem.responseRequestedAt?.getTime() || caseItem.createdAt.getTime())
          )
      ),
      status: "OPEN",
      responseSubmittedAt: new Date()
    }
  });

  await db.notification.createMany({
    data: [
      {
        userId: caseItem.plaintiffId,
        type: "DEFENDANT_RESPONSE_SUBMITTED",
        title: "피고 답변이 도착했어요",
        body: `${caseItem.title} 사건이 공개 재판에 올라갔습니다.`,
        actionUrl: `/cases/${caseId}`
      },
      {
        userId: user.id,
        type: "CASE_OPENED",
        title: "사건이 공개됐어요",
        body: `${caseItem.title} 사건이 공개 피드에 등록됐습니다.`,
        actionUrl: `/cases/${caseId}`
      }
    ]
  });

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/home");
  revalidatePath("/activity");
  revalidatePath("/notifications");
  redirect(`/cases/${caseId}?responded=1`);
}

export async function submitVote(formData: FormData) {
  const user = await requireUser();
  const caseId = field(formData, "caseId");
  const verdict = field(formData, "verdict");
  const sentenceLabel = field(formData, "sentenceLabel");
  const comment = field(formData, "comment");
  const skipsSentence = NO_SENTENCE_VERDICTS.includes(verdict);
  const selectedSentence = skipsSentence ? null : SENTENCE_OPTIONS.find((item) => item.label === sentenceLabel);

  if (!caseId || !VERDICT_OPTIONS.includes(verdict) || (!skipsSentence && !selectedSentence)) {
    redirect(`/cases/${caseId}?error=vote`);
  }

  if (comment.length > JURY_COMMENT_MAX_LENGTH) {
    redirect(`/cases/${caseId}?error=comment`);
  }

  const storedSentence = skipsSentence
    ? { label: NO_SENTENCE_LABEL, months: 0 }
    : selectedSentence;

  if (!storedSentence) {
    redirect(`/cases/${caseId}?error=vote`);
  }

  const db = getPrisma();
  const caseItem = await db.case.findUnique({
    where: { id: caseId },
    include: { _count: { select: { votes: true } } }
  });

  if (!caseItem || caseItem.status !== "OPEN" || caseItem.voteDeadlineAt.getTime() <= Date.now()) {
    await closeCaseIfNeeded(caseId);
    redirect(`/cases/${caseId}?error=closed`);
  }

  if (caseItem._count.votes >= caseItem.maxJurors) {
    await closeCaseIfNeeded(caseId);
    redirect(`/cases/${caseId}?error=full`);
  }

  const existing = await db.vote.findUnique({
    where: { caseId_userId: { caseId, userId: user.id } }
  });

  if (existing) {
    redirect(`/cases/${caseId}?error=already`);
  }

  await db.vote.create({
    data: {
      caseId,
      userId: user.id,
      verdict,
      sentenceLabel: storedSentence.label,
      sentenceMonths: storedSentence.months,
      comment: comment || null
    }
  });

  const newVoteCount = caseItem._count.votes + 1;
  if (newVoteCount >= caseItem.maxJurors) {
    await db.case.update({ where: { id: caseId }, data: { status: "CLOSED" } });
    await db.notification.create({
      data: {
        userId: caseItem.plaintiffId,
        type: "CASE_CLOSED",
        title: "사건 투표가 마감됐어요",
        body: `${caseItem.title} 사건이 배심원 100명을 채웠습니다.`
      }
    });
  } else {
    await db.notification.create({
      data: {
        userId: caseItem.plaintiffId,
        type: "NEW_VOTE",
        title: "새 배심원이 참여했어요",
        body: `${caseItem.title} 사건의 현재 배심원은 ${newVoteCount}명입니다.`
      }
    });
  }

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/home");
  redirect(`/cases/${caseId}?voted=1`);
}

export async function createCaseComment(formData: FormData) {
  const user = await requireUser();
  const caseId = field(formData, "caseId");
  const parentId = field(formData, "parentId") || null;
  const body = field(formData, "body");

  if (!caseId || !body) {
    redirect(caseId ? `/cases/${caseId}?error=commentRequired` : "/home");
  }

  if (body.length > CASE_COMMENT_MAX_LENGTH) {
    redirect(`/cases/${caseId}?error=caseComment`);
  }

  const db = getPrisma();
  const caseItem = await db.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      status: true,
      adminHidden: true,
      plaintiffId: true,
      defendantId: true
    }
  });

  if (!caseItem || caseItem.status === "HIDDEN" || caseItem.adminHidden) {
    redirect("/home");
  }

  const visibleToPublic = ["OPEN", "CLOSED", "VERDICT_DONE"].includes(caseItem.status);
  const participant = caseItem.plaintiffId === user.id || caseItem.defendantId === user.id;
  if (!visibleToPublic && !participant) {
    redirect("/home");
  }

  if (parentId) {
    const parent = await db.caseComment.findUnique({
      where: { id: parentId },
      select: { caseId: true, parentId: true }
    });

    if (!parent || parent.caseId !== caseId || parent.parentId) {
      redirect(`/cases/${caseId}?error=reply`);
    }
  }

  await db.caseComment.create({
    data: {
      caseId,
      userId: user.id,
      parentId,
      body
    }
  });

  revalidatePath(`/cases/${caseId}`);
  redirect(`/cases/${caseId}?commented=1`);
}

export async function createCaseCommentInline(
  _prevState: CaseCommentActionState,
  formData: FormData
): Promise<CaseCommentActionState> {
  const user = await requireUser();
  const caseId = field(formData, "caseId");
  const parentId = field(formData, "parentId") || null;
  const body = field(formData, "body");
  const submittedAt = Date.now();

  if (!caseId || !body) {
    return { ok: false, message: "댓글 내용을 입력하세요.", submittedAt };
  }

  if (body.length > CASE_COMMENT_MAX_LENGTH) {
    return { ok: false, message: `댓글은 ${CASE_COMMENT_MAX_LENGTH}자 이하로 적어주세요.`, submittedAt };
  }

  const db = getPrisma();
  const caseItem = await db.case.findUnique({
    where: { id: caseId },
    select: {
      id: true,
      status: true,
      adminHidden: true,
      plaintiffId: true,
      defendantId: true
    }
  });

  if (!caseItem || caseItem.status === "HIDDEN" || caseItem.adminHidden) {
    return { ok: false, message: "댓글을 등록할 수 없는 사건입니다.", submittedAt };
  }

  const visibleToPublic = ["OPEN", "CLOSED", "VERDICT_DONE"].includes(caseItem.status);
  const participant = caseItem.plaintiffId === user.id || caseItem.defendantId === user.id;
  if (!visibleToPublic && !participant) {
    return { ok: false, message: "댓글을 등록할 수 없는 사건입니다.", submittedAt };
  }

  if (parentId) {
    const parent = await db.caseComment.findUnique({
      where: { id: parentId },
      select: { caseId: true, parentId: true }
    });

    if (!parent || parent.caseId !== caseId || parent.parentId) {
      return { ok: false, message: "답글을 달 댓글을 확인하세요.", submittedAt };
    }
  }

  await db.caseComment.create({
    data: {
      caseId,
      userId: user.id,
      parentId,
      body
    }
  });

  revalidatePath(`/cases/${caseId}`);

  return {
    ok: true,
    message: parentId ? "답글이 등록됐습니다." : "댓글이 등록됐습니다.",
    submittedAt
  };
}

export async function reflectVerdictToProfile(formData: FormData) {
  const user = await requireUser();
  const caseId = field(formData, "caseId");
  const db = getPrisma();
  const verdict = await ensureVerdictForCase(caseId);

  if (!verdict) {
    redirect(`/cases/${caseId}/verdict?error=notready`);
  }

  const caseItem = await db.case.findUnique({ where: { id: caseId } });
  if (!caseItem) {
    redirect("/home");
  }

  if (verdict.reflectedToProfile) {
    redirect("/me?reflected=already");
  }

  let targetUserIds: string[] = [];
  if (verdict.finalVerdict === "원고 승") {
    targetUserIds = [caseItem.defendantId || caseItem.plaintiffId];
  } else if (verdict.finalVerdict === "피고 승") {
    targetUserIds = [caseItem.plaintiffId];
  } else if (verdict.finalVerdict === "쌍방과실" || verdict.finalVerdict === "화해 권고") {
    targetUserIds = [caseItem.plaintiffId, caseItem.defendantId].filter(Boolean) as string[];
  }

  if (!targetUserIds.length) {
    targetUserIds = [user.id];
  }

  await db.$transaction([
    ...targetUserIds.map((targetUserId) =>
      db.sentenceRecord.create({
        data: {
          userId: targetUserId,
          caseId,
          title: caseItem.title,
          sentenceMonths: verdict.sentenceMonths,
          sentenceLabel: verdict.sentenceLabel,
          remainingMonths: verdict.sentenceMonths >= 9999 ? 9999 : verdict.sentenceMonths,
          status: verdict.sentenceMonths === 0 ? "SUSPENDED" : "ACTIVE"
        }
      })
    ),
    db.verdict.update({
      where: { id: verdict.id },
      data: { reflectedToProfile: true }
    }),
    ...targetUserIds.map((targetUserId) =>
      db.notification.create({
        data: {
          userId: targetUserId,
          type: "VERDICT_REFLECTED",
          title: "판결 결과가 프로필에 반영됐어요",
          body: `${caseItem.title} 사건의 형량 기록이 저장됐습니다.`
        }
      })
    )
  ]);

  revalidatePath("/me");
  redirect("/me?reflected=1");
}

export async function createReport(formData: FormData) {
  const user = await requireUser();
  const caseId = field(formData, "caseId");
  const targetUserId = field(formData, "targetUserId") || null;
  const reason = field(formData, "reason");
  const detail = field(formData, "detail");

  if (!reason) {
    redirect(`/cases/${caseId}?error=report`);
  }

  await getPrisma().report.create({
    data: {
      reporterId: user.id,
      caseId,
      targetUserId,
      reason,
      detail
    }
  });

  revalidatePath(`/cases/${caseId}`);
  redirect(`/cases/${caseId}?reported=1`);
}

export async function blockUser(formData: FormData) {
  const user = await requireUser();
  const blockedUserId = field(formData, "blockedUserId");
  const caseId = field(formData, "caseId");

  if (!blockedUserId || blockedUserId === user.id) {
    redirect(caseId ? `/cases/${caseId}` : "/home");
  }

  await getPrisma().block.upsert({
    where: { blockerId_blockedUserId: { blockerId: user.id, blockedUserId } },
    create: { blockerId: user.id, blockedUserId },
    update: {}
  });

  revalidatePath("/home");
  redirect("/home?blocked=1");
}

export async function markAllNotificationsRead() {
  const user = await requireUser();
  await getPrisma().notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() }
  });

  revalidatePath("/notifications");
  redirect("/notifications");
}

export async function hideCaseAsAdmin(formData: FormData) {
  const secret = field(formData, "adminSecret");
  const caseId = field(formData, "caseId");
  const reportId = field(formData, "reportId");

  if (!adminAllowed(secret)) {
    redirect("/admin?error=secret");
  }

  await getPrisma().case.update({
    where: { id: caseId },
    data: { status: "HIDDEN", adminHidden: true }
  });

  if (reportId) {
    await getPrisma().report.update({ where: { id: reportId }, data: { status: "ACTIONED" } });
  }

  revalidatePath("/admin");
  revalidatePath("/home");
  redirect(`/admin?secret=${encodeURIComponent(secret)}`);
}

export async function blockReportedUserAsAdmin(formData: FormData) {
  const secret = field(formData, "adminSecret");
  const reportId = field(formData, "reportId");

  if (!adminAllowed(secret)) {
    redirect("/admin?error=secret");
  }

  const report = await getPrisma().report.findUnique({
    where: { id: reportId },
    include: { case: true }
  });

  if (report) {
    const targetUserId = report.targetUserId || report.case?.plaintiffId;
    if (targetUserId && targetUserId !== report.reporterId) {
      await getPrisma().block.upsert({
        where: {
          blockerId_blockedUserId: {
            blockerId: report.reporterId,
            blockedUserId: targetUserId
          }
        },
        create: { blockerId: report.reporterId, blockedUserId: targetUserId },
        update: {}
      });
    }
    await getPrisma().report.update({ where: { id: reportId }, data: { status: "ACTIONED" } });
  }

  revalidatePath("/admin");
  redirect(`/admin?secret=${encodeURIComponent(secret)}`);
}
