import { NextResponse } from "next/server";
import { getUserByEmail as getUserByEmailDb, createUser, initDb } from "@/lib/db";
import {
  createSessionCookie,
  createSessionToken,
  hashPassword,
} from "@/lib/auth";
import {
  normalizeEmail,
  validateFullName,
  validateGmailEmail,
  validatePassword,
  isBlockedEmail,
  SubscriptionTier,
  isSuperAdmin,
  hasUltimateAccess,
  hasProAccess,
  hasBasicAccess,
} from "@/lib/auth-types";

export async function POST(req: Request) {
  const body = await req.json();
  const fullName = String(body.fullName || "").trim();
  const email = normalizeEmail(String(body.email || ""));
  const password = String(body.password || "");
  const subscriptionTier = (body.subscriptionTier || "trial") as SubscriptionTier;

  if (!validateFullName(fullName)) {
    return NextResponse.json(
      { error: "Please enter your full name." },
      { status: 400 },
    );
  }

  if (!validateGmailEmail(email)) {
    return NextResponse.json(
      { error: "Please use a valid Gmail address (gmail.com or googlemail.com)." },
      { status: 400 },
    );
  }

  if (isBlockedEmail(email)) {
    return NextResponse.json(
      { error: "This email is not allowed to access the site." },
      { status: 403 },
    );
  }

  if (!validatePassword(password)) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  try {
    await initDb();
    const existing = await getUserByEmailDb(email);
    if (existing) {
      return NextResponse.json(
        { error: "A user with that email already exists. Please sign in." },
        { status: 409 },
      );
    }

    const { salt, hash: passwordHash } = await hashPassword(password);
    const createdAt = new Date().toISOString();
    const trialEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const user = await createUser({
      fullName,
      email,
      passwordHash,
      salt,
      createdAt,
      trialEndsAt,
      membershipStatus: "trial",
      subscriptionTier,
    });
    const isSuperAdminUser = isSuperAdmin(user.email);
    let redirectUrl = "/";
    if (hasUltimateAccess(user.subscriptionTier, isSuperAdminUser)) {
      redirectUrl = "/ultimate";
    } else if (hasProAccess(user.subscriptionTier, isSuperAdminUser)) {
      redirectUrl = "/pro";
    } else if (hasBasicAccess(user.subscriptionTier, isSuperAdminUser)) {
      redirectUrl = "/basic";
    }

    const token = createSessionToken({
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      trialEndsAt: user.trialEndsAt,
      membershipStatus: user.membershipStatus,
      subscriptionTier: user.subscriptionTier as SubscriptionTier,
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          fullName: user.fullName,
          email: user.email,
          subscriptionTier: user.subscriptionTier,
          isSuperAdmin: isSuperAdminUser,
        },
        redirectUrl,
      },
      {
        headers: {
          "Set-Cookie": createSessionCookie(token),
        },
      },
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Unable to create account. Please try again." },
      { status: 500 },
    );
  }
}
