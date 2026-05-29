import { NextResponse } from "next/server";
import { getUserByEmail as getUserByEmailDb, getUserByEmailFallback, initDb } from "@/lib/db";
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
  SubscriptionTier,
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
    let user = await getUserByEmailDb(email);
    
    // Fallback to local-users.json if database is not available
    if (!user) {
      console.log('Database user not found, trying fallback to local-users.json');
      user = await getUserByEmailFallback(email);
      console.log('Fallback user found:', user ? 'YES' : 'NO');
    }
    
    if (!user) {
      console.log('No user found for email:', email);
      return NextResponse.json(
        { error: "No account found for that email." },
        { status: 401 },
      );
    }

    console.log('User found, verifying password for:', email);
    const isValid = await verifyPassword(password, user.salt, user.passwordHash);
    console.log('Password valid:', isValid);
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
      subscriptionTier: user.subscriptionTier as SubscriptionTier,
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
          subscriptionTier: user.subscriptionTier as SubscriptionTier,
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
