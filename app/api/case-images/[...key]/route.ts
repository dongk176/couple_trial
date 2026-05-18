import { createHash, createHmac } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

function getS3Config() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;

  if (!region || !bucket || !accessKeyId || !secretAccessKey) return null;

  return { region, bucket, accessKeyId, secretAccessKey, sessionToken };
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

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const config = getS3Config();
  if (!config) return new Response("Upload storage is not configured.", { status: 503 });

  const { key: keyParts } = await params;
  const key = keyParts.map(decodeURIComponent).join("/");
  if (!key.startsWith("couple-court/cases/")) return new Response("Not found.", { status: 404 });

  const encodedKey = encodeS3Key(key);
  const usePathStyle = config.bucket.includes(".");
  const host = usePathStyle ? `s3.${config.region}.amazonaws.com` : `${config.bucket}.s3.${config.region}.amazonaws.com`;
  const canonicalUri = usePathStyle ? `/${encodeURIComponent(config.bucket)}/${encodedKey}` : `/${encodedKey}`;
  const url = `https://${host}${canonicalUri}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = "UNSIGNED-PAYLOAD";
  const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const headersToSign: Record<string, string> = {
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
  const canonicalRequest = ["GET", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hashHex(canonicalRequest)].join("\n");
  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, config.region);
  const serviceKey = hmac(regionKey, "s3");
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...headersToSign,
      authorization
    }
  });

  if (!response.ok || !response.body) {
    return new Response("Not found.", { status: response.status === 403 ? 404 : response.status });
  }

  const headers = new Headers();
  headers.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");
  headers.set("Cache-Control", "private, max-age=3600");

  const contentLength = response.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  return new Response(response.body, { status: 200, headers });
}
