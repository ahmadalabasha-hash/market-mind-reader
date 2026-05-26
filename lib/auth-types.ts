// Client-safe types and helper functions - NO Node.js crypto imports

export type SubscriptionTier = "basic" | "pro" | "ultimate" | "trial" | "none";

export type AuthSessionPayload = {
  email: string;
  fullName: string;
  createdAt?: string;
  trialEndsAt?: string;
  membershipStatus?: string;
  subscriptionTier?: SubscriptionTier;
  isSuperAdmin?: boolean;
  iat: number;
};

export const SESSION_COOKIE_NAME = "ms_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

// Super admin emails - these users can view all tiers and bypass payment
export const SUPER_ADMIN_EMAILS = [
  "pengaflodemedoptionerstrading@gmail.com",
  "siram08742@gmail.com",
];

export function isSuperAdmin(email: string): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return SUPER_ADMIN_EMAILS.includes(normalizedEmail);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateEmail(email: string) {
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

export function validateGmailEmail(email: string) {
  const normalized = normalizeEmail(email);
  return validateEmail(normalized) && /@(?:gmail\.com|googlemail\.com)$/.test(normalized);
}

export function validatePassword(password: string) {
  return typeof password === "string" && password.length >= 8;
}

export function validateFullName(fullName: string) {
  return typeof fullName === "string" && fullName.trim().length >= 2;
}

export function isBlockedEmail(email: string) {
  return normalizeEmail(email) === "test@test.com";
}

export function normalizePrivateKey(key: string | undefined): string {
  if (!key) return "";
  return key.replace(/\\n/g, "\n");
}

// Parse cookies from header string (works in both Node.js and browser)
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;

  for (const part of cookieHeader.split(";")) {
    const [name, value] = part.split("=").map((v) => v.trim());
    if (name && value) {
      cookies[name] = value;
    }
  }

  return cookies;
}

// Tier hierarchy for access control (higher index = more access)
const TIER_HIERARCHY: SubscriptionTier[] = ["none", "trial", "basic", "pro", "ultimate"];

/**
 * Check if a user has access to content of a specific tier
 * Super admins can see ALL tiers
 * Basic can see: basic only
 * Pro can see: basic + pro
 * Ultimate can see: basic + pro + ultimate
 */
export function hasTierAccess(
  userTier: SubscriptionTier | undefined,
  requiredTier: SubscriptionTier,
  isUserSuperAdmin?: boolean
): boolean {
  // Super admins bypass all tier restrictions
  if (isUserSuperAdmin) return true;

  const userIndex = TIER_HIERARCHY.indexOf(userTier || "none");
  const requiredIndex = TIER_HIERARCHY.indexOf(requiredTier);

  if (userIndex === -1 || requiredIndex === -1) return false;

  // User must have equal or higher tier than required
  return userIndex >= requiredIndex;
}

/**
 * Get the highest tier a user has access to
 * Super admins return "ultimate" as their effective tier
 */
export function getUserTier(session: AuthSessionPayload | null): SubscriptionTier {
  if (!session) return "none";
  // Super admins always have ultimate access
  if (session.isSuperAdmin) return "ultimate";
  return session.subscriptionTier || "trial";
}

/**
 * Check if user has at least basic access
 */
export function hasBasicAccess(userTier: SubscriptionTier | undefined, isUserSuperAdmin?: boolean): boolean {
  return hasTierAccess(userTier, "basic", isUserSuperAdmin);
}

/**
 * Check if user has at least pro access
 */
export function hasProAccess(userTier: SubscriptionTier | undefined, isUserSuperAdmin?: boolean): boolean {
  return hasTierAccess(userTier, "pro", isUserSuperAdmin);
}

/**
 * Check if user has ultimate access
 */
export function hasUltimateAccess(userTier: SubscriptionTier | undefined, isUserSuperAdmin?: boolean): boolean {
  return hasTierAccess(userTier, "ultimate", isUserSuperAdmin);
}

// Simple base64 URL encoding/decoding (works in both Node and browser)
export function base64UrlEncode(value: string): string {
  if (typeof window !== "undefined") {
    // Browser
    return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  // Node.js - this will be handled by the server file
  return Buffer.from(value).toString("base64url");
}

export function base64UrlDecode(value: string): string {
  if (typeof window !== "undefined") {
    // Browser
    const padding = "=".repeat((4 - (value.length % 4)) % 4);
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/") + padding;
    return atob(base64);
  }
  // Node.js - this will be handled by the server file
  return Buffer.from(value, "base64url").toString("utf8");
}
