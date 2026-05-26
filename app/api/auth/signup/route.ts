import { NextResponse } from "next/server";
import { appendUser, getUserByEmail, isSheetsConfigured } from "@/lib/google-sheets";
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
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "A user with that email already exists. Please sign in." },
        { status: 409 },
      );
    }

    const { salt, hash: passwordHash } = await hashPassword(password);
    const user = await appendUser({ fullName, email, password, passwordHash, salt, subscriptionTier });
    const token = createSessionToken({
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      trialEndsAt: user.trialEndsAt,
      membershipStatus: user.membershipStatus,
      subscriptionTier: user.subscriptionTier,
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          fullName: user.fullName,
          email: user.email,
        },
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
