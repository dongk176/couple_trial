import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";

const SESSION_COOKIE = "couple_court_session";
const maxAge = 60 * 60 * 24 * 30;

function getSecret() {
  return process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || "local-dev-only-change-me";
}

function signUserId(userId: string) {
  return createHmac("sha256", getSecret()).update(userId).digest("hex");
}

function createSessionValue(userId: string) {
  return `${userId}.${signUserId(userId)}`;
}

function readSessionValue(value?: string) {
  if (!value) return null;
  const [userId, signature] = value.split(".");
  if (!userId || !signature) return null;

  const expected = signUserId(userId);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null;
  return userId;
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionValue(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = readSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  return getPrisma().user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      loginId: true,
      nickname: true,
      avatar: true,
      createdAt: true
    }
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
