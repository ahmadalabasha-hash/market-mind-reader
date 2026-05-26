"use client";

import { ReactNode } from "react";
import { SubscriptionTier, hasTierAccess, SUPER_ADMIN_EMAILS } from "@/lib/auth-types";
import Link from "next/link";

interface TierGateProps {
  userTier: SubscriptionTier | undefined;
  requiredTier: SubscriptionTier;
  isSuperAdmin?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders content based on user's subscription tier
 * Basic users see: Basic content only
 * Pro users see: Basic + Pro content
 * Ultimate users see: Basic + Pro + Ultimate content
 * Super admins see: ALL content regardless of tier
 */
export function TierGate({ userTier, requiredTier, isSuperAdmin = false, children, fallback }: TierGateProps) {
  const hasAccess = hasTierAccess(userTier, requiredTier, isSuperAdmin);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    return <TierUpgradePrompt requiredTier={requiredTier} userTier={userTier} />;
  }

  return <>{children}</>;
}

/**
 * Upgrade prompt shown when user doesn't have required tier
 */
function TierUpgradePrompt({ requiredTier, userTier }: { requiredTier: SubscriptionTier; userTier: SubscriptionTier | undefined }) {
  const tierNames: Record<SubscriptionTier, string> = {
    basic: "Basic ($400/month)",
    pro: "Pro ($800/month)",
    ultimate: "Ultimate ($1500/month)",
    trial: "Trial",
    none: "Free"
  };

  const currentTier = userTier || "none";

  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-800/50 p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700">
        <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h4 className="text-lg font-semibold text-zinc-100">Premium Content Locked</h4>
      <p className="mt-2 text-sm text-zinc-400">
        You need <span className="font-medium text-amber-400">{tierNames[requiredTier]}</span> to access this content.
      </p>
      {currentTier !== "ultimate" && (
        <Link
          href="/pricing"
          className="mt-4 inline-block rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:from-amber-500 hover:to-orange-600"
        >
          Upgrade Now
        </Link>
      )}
    </div>
  );
}

/**
 * Badge showing content tier level
 */
export function TierBadge({ tier }: { tier: SubscriptionTier }) {
  const tierStyles: Record<SubscriptionTier, string> = {
    basic: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    pro: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    ultimate: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    trial: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
    none: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30"
  };

  const tierLabels: Record<SubscriptionTier, string> = {
    basic: "BASIC",
    pro: "PRO",
    ultimate: "ULTIMATE",
    trial: "TRIAL",
    none: "FREE"
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tierStyles[tier]}`}>
      {tierLabels[tier]}
    </span>
  );
}

/**
 * Container that adds a visual indicator for tiered content
 */
interface TieredContentProps {
  tier: SubscriptionTier;
  userTier: SubscriptionTier | undefined;
  isSuperAdmin?: boolean;
  children: ReactNode;
  title?: string;
  description?: string;
}

export function TieredContent({ tier, userTier, isSuperAdmin = false, children, title, description }: TieredContentProps) {
  const hasAccess = hasTierAccess(userTier, tier, isSuperAdmin);

  const tierBorderColors: Record<SubscriptionTier, string> = {
    basic: "border-blue-500/30",
    pro: "border-purple-500/30",
    ultimate: "border-amber-500/30",
    trial: "border-zinc-500/30",
    none: "border-zinc-500/30"
  };

  return (
    <div className={`relative rounded-2xl border-2 ${tierBorderColors[tier]} bg-zinc-900/50 p-6`}>
      {/* Tier Badge Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          {title && <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>}
          {description && <p className="text-sm text-zinc-400">{description}</p>}
        </div>
        <TierBadge tier={tier} />
      </div>

      {/* Content or Lock */}
      {hasAccess ? (
        <div className="space-y-4">{children}</div>
      ) : (
        <TierUpgradePrompt requiredTier={tier} userTier={userTier} />
      )}
    </div>
  );
}
