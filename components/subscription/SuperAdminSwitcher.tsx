"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SubscriptionTier, SUPER_ADMIN_EMAILS } from "@/lib/auth-types";

interface SuperAdminSwitcherProps {
  currentTier: SubscriptionTier;
}

/**
 * Super Admin Tier Switcher - Allows admin users to simulate different subscription tiers
 * This lets them see the website from the customer's perspective without payment
 */
export function SuperAdminSwitcher({ currentTier }: SuperAdminSwitcherProps) {
  const router = useRouter();
  const [simulatedTier, setSimulatedTier] = useState<SubscriptionTier>(currentTier);

  // Available tiers for simulation
  const tiers: { value: SubscriptionTier; label: string; color: string; desc: string }[] = [
    { value: "trial", label: "Free Trial", color: "bg-zinc-500", desc: "1 day free access" },
    { value: "basic", label: "Basic", color: "bg-blue-500", desc: "$400/month - Market Indices Only" },
    { value: "pro", label: "Pro", color: "bg-purple-500", desc: "$800/month - +Stocks Signals" },
    { value: "ultimate", label: "Ultimate", color: "bg-amber-500", desc: "$1500/month - Full Access" },
  ];

  // Handle tier selection
  const handleTierChange = (tier: SubscriptionTier) => {
    setSimulatedTier(tier);
    // Store simulated tier in localStorage for persistence
    localStorage.setItem("superAdminSimulatedTier", tier);
    // Reload page to apply the simulation (in a real implementation, you'd use a state management solution)
    window.location.reload();
  };

  // Load simulated tier from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("superAdminSimulatedTier") as SubscriptionTier | null;
    if (stored && SUPER_ADMIN_EMAILS.length > 0) {
      setSimulatedTier(stored);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 flex-shrink-0">
          <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-emerald-100">Super Admin Mode</h3>
              <p className="text-sm text-emerald-300/80">
                You have full access to all tiers. Click a tier below to preview how customers see the website.
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <span className="text-xs font-medium text-emerald-300">Full Bypass Active</span>
            </div>
          </div>

          {/* Tier Selection Buttons */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {tiers.map((tier) => (
              <button
                key={tier.value}
                onClick={() => handleTierChange(tier.value)}
                className={`relative rounded-xl border p-3 text-left transition-all ${
                  simulatedTier === tier.value
                    ? "border-emerald-400 bg-emerald-500/20"
                    : "border-zinc-600 bg-zinc-800/50 hover:border-zinc-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                  <span className={`font-semibold ${simulatedTier === tier.value ? "text-emerald-100" : "text-zinc-200"}`}>
                    {tier.label}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{tier.desc}</p>
                {simulatedTier === tier.value && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-emerald-400/60">
            Currently viewing as: <span className="font-semibold text-emerald-300">{tiers.find(t => t.value === simulatedTier)?.label || "Ultimate"}</span>
            {" "}(simulated)
          </p>
        </div>
      </div>
    </div>
  );
}
