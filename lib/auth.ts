import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { AuthSessionPayload } from "./auth-types";
import { normalizeEmail, isSuperAdmin, SESSION_COOKIE_NAME, SESSION_MAX_AGE, parseCookies } from "./auth-types";

const scrypt = promisify(scryptCallback);

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET environment variable.");
  }
  return secret;
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return {
    salt,
    hash: derived.toString("hex"),
  };
}

export async function verifyPassword(
  candidate: string,
  salt: string,
  storedHash: string,
) {
  const derived = (await scrypt(candidate, salt, 64)) as Buffer;
  const candidateHash = derived.toString("hex");
  const candidateBuffer = Buffer.from(candidateHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (candidateBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(candidateBuffer, storedBuffer);
}

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createSessionToken(payload: Omit<AuthSessionPayload, "iat">) {
  const normalizedEmail = normalizeEmail(payload.email);
  const body = {
    ...payload,
    email: normalizedEmail,
    isSuperAdmin: isSuperAdmin(normalizedEmail),
    iat: Date.now(),
  };
  const encoded = base64UrlEncode(JSON.stringify(body));
  const signature = base64UrlEncode(
    createHmac("sha256", getAuthSecret()).update(encoded).digest(),
  );
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token || token.indexOf(".") === -1) return null;
  const [encoded, signature] = token.split(".", 2);
  if (!encoded || !signature) return null;

  const expectedSignature = base64UrlEncode(
    createHmac("sha256", getAuthSecret()).update(encoded).digest(),
  );

  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as AuthSessionPayload;
    if (!payload.email || !payload.fullName || !payload.iat) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSessionCookie(token: string) {
  const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; ${secure} SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "Secure;" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; ${secure} SameSite=Lax; Max-Age=0`;
}

export function getSessionFromRequest(req: Request) {
  const cookies = parseCookies(req.headers.get("cookie"));
  return verifySessionToken(cookies[SESSION_COOKIE_NAME]);
}
