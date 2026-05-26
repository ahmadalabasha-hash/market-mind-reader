import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { getUserByEmail } from "@/lib/google-sheets";
import { isSuperAdmin } from "@/lib/auth-types";

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  const currentUser = await getUserByEmail(session.email);
  if (currentUser) {
    // Check if trial has ended
    if (currentUser.membershipStatus === "trial" && currentUser.trialEndsAt) {
      const trialEndDate = new Date(currentUser.trialEndsAt);
      const now = new Date();
      if (trialEndDate < now) {
        return NextResponse.json({ user: null, trialExpired: true });
      }
    }

    return NextResponse.json({
      user: {
        email: currentUser.email,
        fullName: currentUser.fullName,
        createdAt: currentUser.createdAt,
        trialEndsAt: currentUser.trialEndsAt,
        membershipStatus: currentUser.membershipStatus,
        subscriptionTier: currentUser.subscriptionTier,
        isSuperAdmin: isSuperAdmin(currentUser.email),
      },
    });
  }

  // Check session trial expiration if user not found in database
  if (session.membershipStatus === "trial" && session.trialEndsAt) {
    const trialEndDate = new Date(session.trialEndsAt);
    const now = new Date();
    if (trialEndDate < now) {
      return NextResponse.json({ user: null, trialExpired: true });
    }
  }

  return NextResponse.json({
    user: {
      email: session.email,
      fullName: session.fullName,
      createdAt: session.createdAt ?? new Date().toISOString(),
      trialEndsAt: session.trialEndsAt,
      membershipStatus: session.membershipStatus ?? "trial",
      subscriptionTier: session.subscriptionTier ?? "trial",
      isSuperAdmin: session.isSuperAdmin ?? isSuperAdmin(session.email),
    },
  });
}
