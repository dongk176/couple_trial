import { createHash, createPublicKey, createVerify, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { AVATAR_OPTIONS } from "@/lib/constants";
import { setSessionCookie } from "@/lib/auth";
import { createUniqueInviteCode } from "@/lib/invites";
import { getPrisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";
const APPLE_ISSUER = "https://appleid.apple.com";
const DEFAULT_BUNDLE_ID = "com.dongmin.coupletrial";

type AppleJwtHeader = {
  alg?: string;
  kid?: string;
};

type AppleJwtPayload = {
  iss?: string;
  aud?: string | string[];
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
};

type AppleJwk = {
  kid: string;
  kty: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
};

type AppleKeysResponse = {
  keys?: AppleJwk[];
};

function decodeJwtPart<T>(part: string) {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as T;
}

function expectedAudiences() {
  return Array.from(new Set([process.env.APPLE_BUNDLE_ID, process.env.IOS_BUNDLE_ID, DEFAULT_BUNDLE_ID].filter(Boolean))) as string[];
}

function hasExpectedAudience(aud: string | string[] | undefined) {
  const allowed = expectedAudiences();
  if (typeof aud === "string") return allowed.includes(aud);
  if (Array.isArray(aud)) return aud.some((value) => allowed.includes(value));
  return false;
}

async function fetchAppleKey(kid: string) {
  const response = await fetch(APPLE_KEYS_URL, { cache: "force-cache" });
  if (!response.ok) throw new Error("APPLE_KEYS_FETCH_FAILED");

  const body = (await response.json()) as AppleKeysResponse;
  const key = body.keys?.find((candidate) => candidate.kid === kid);
  if (!key) throw new Error("APPLE_KEY_NOT_FOUND");
  return key;
}

async function verifyAppleIdentityToken(identityToken: string) {
  const parts = identityToken.split(".");
  if (parts.length !== 3) throw new Error("INVALID_APPLE_TOKEN");

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeJwtPart<AppleJwtHeader>(encodedHeader);
  const payload = decodeJwtPart<AppleJwtPayload>(encodedPayload);

  if (header.alg !== "RS256" || !header.kid) throw new Error("INVALID_APPLE_TOKEN_HEADER");

  const jwk = await fetchAppleKey(header.kid);
  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  const publicKey = createPublicKey({ key: jwk, format: "jwk" });
  const signature = Buffer.from(encodedSignature, "base64url");
  if (!verifier.verify(publicKey, signature)) throw new Error("INVALID_APPLE_TOKEN_SIGNATURE");

  const now = Math.floor(Date.now() / 1000);
  if (payload.iss !== APPLE_ISSUER) throw new Error("INVALID_APPLE_ISSUER");
  if (!hasExpectedAudience(payload.aud)) throw new Error("INVALID_APPLE_AUDIENCE");
  if (!payload.exp || payload.exp < now - 30) throw new Error("APPLE_TOKEN_EXPIRED");
  if (payload.iat && payload.iat > now + 300) throw new Error("INVALID_APPLE_ISSUED_AT");
  if (!payload.sub) throw new Error("MISSING_APPLE_SUBJECT");

  return payload;
}

function cleanFullName(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  return [record.familyName, record.middleName, record.givenName]
    .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
    .join(" ")
    .trim();
}

function loginIdForAppleSub(appleSub: string) {
  return `apple_${createHash("sha256").update(appleSub).digest("hex").slice(0, 16)}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      identityToken?: unknown;
      authorizationCode?: unknown;
      fullName?: unknown;
    };

    if (typeof body.identityToken !== "string" || !body.identityToken.trim()) {
      return NextResponse.json({ ok: false, error: "identity_token_required" }, { status: 400 });
    }

    const applePayload = await verifyAppleIdentityToken(body.identityToken.trim());
    const appleSub = applePayload.sub;
    if (!appleSub) throw new Error("MISSING_APPLE_SUBJECT");

    const db = getPrisma();
    const existingUser = await db.user.findUnique({ where: { appleSub } });
    const fullName = cleanFullName(body.fullName);
    const nickname = fullName || "Apple 배심원";

    const user = existingUser ||
      (await db.user.create({
        data: {
          appleSub,
          email: applePayload.email || null,
          loginId: loginIdForAppleSub(appleSub),
          inviteCode: await createUniqueInviteCode(db),
          passwordHash: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
          nickname,
          avatar: AVATAR_OPTIONS[0]
        }
      }));

    await setSessionCookie(user.id);
    return NextResponse.json(
      { ok: true, redirectTo: "/home" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Apple login failed", error);
    return NextResponse.json(
      { ok: false, error: "apple_login_failed" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
}
