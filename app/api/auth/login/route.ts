import { NextResponse } from "next/server";
import { getUserByEmail as getUserByEmailDb, initDb } from "@/lib/db";
import {
  createSessionCookie,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";
import {
  normalizeEmail,
  validateGmailEmail,
  validatePassword,
  isBlockedEmail,
  isSuperAdmin,
  hasUltimateAccess,
  hasProAccess,
  hasBasicAccess,
} from "@/lib/auth-types";

export async function POST(req: Request) {
  const body = await req.json();
  const email = normalizeEmail(String(body.email || ""));
  const password = String(body.password || "");

  if (!validateGmailEmail(email)) {
    return NextResponse.json(
      { error: "Please enter a valid Gmail address." },
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
      { error: "Please enter a valid password." },
      { status: 400 },
    );
  }

  try {
    await initDb();
    const user = await getUserByEmailDb(email);
    if (!user) {
      return NextResponse.json(
        { error: "No account found for that email." },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(password, user.salt, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email or password is incorrect." },
        { status: 401 },
      );
    }

    // Check if trial has ended
    if (user.membershipStatus === "trial" && user.trialEndsAt) {
      const trialEndDate = new Date(user.trialEndsAt);
      const now = new Date();
      if (trialEndDate < now) {
        return NextResponse.json(
          { 
            error: "Your trial period has ended. To continue using the website, you need to continue your subscription and add a payment method.",
            trialExpired: true
          },
          { status: 403 },
        );
      }
    }

    const token = createSessionToken({
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      trialEndsAt: user.trialEndsAt,
      membershipStatus: user.membershipStatus,
      subscriptionTier: user.subscriptionTier,
    });

    const isSuperAdminUser = isSuperAdmin(user.email);
    
    // Determine redirect URL based on tier
    let redirectUrl = "/pricing";
    if (hasUltimateAccess(user.subscriptionTier, isSuperAdminUser)) {
      redirectUrl = "/ultimate";
    } else if (hasProAccess(user.subscriptionTier, isSuperAdminUser)) {
      redirectUrl = "/pro";
    } else if (hasBasicAccess(user.subscriptionTier, isSuperAdminUser)) {
      redirectUrl = "/basic";
    }

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
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Unable to process login. Please try again." },
      { status: 500 },
    );
  }
}
