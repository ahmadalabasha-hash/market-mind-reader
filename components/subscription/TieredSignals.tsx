"use client";

import { SubscriptionTier } from "@/lib/auth-types";
import { TierGate, TierBadge, TieredContent } from "./TierGate";
import { SignalRow } from "@/lib/signals";
import { BasicSignalsCard } from "./BasicSignalsCard";
import { ProSignalsCard } from "./ProSignalsCard";
import { UltimateSection } from "./UltimateSection";

interface TieredSignalsProps {
  userTier: SubscriptionTier | undefined;
  isSuperAdmin?: boolean;
  signals: SignalRow[];
}

/**
 * BASIC TIER CONTENT: Market Indices Only
 * Shows daily signals for SPY, SPX, NQ, ES, QQQ
 */
export function BasicSignals({ userTier, isSuperAdmin = false, signals }: TieredSignalsProps) {
  const indicesSymbols = ["SPY", "SPX", "NQ", "ES", "QQQ"];
  const indicesSignals = signals.filter(s => indicesSymbols.includes(s.symbol.toUpperCase()));

  return (
    <TieredContent
      tier="basic"
      userTier={userTier}
      isSuperAdmin={isSuperAdmin}
      title="Market Indices Signals"
      description="Daily signals with bias for major market indices"
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Includes 90% average consistency on bias, key interest zones, entry/exit areas.
        </p>
        <div className="grid gap-4">
          {indicesSignals.length > 0 ? (
            indicesSignals.map((signal) => (
              <BasicSignalsCard key={signal.symbol} signal={signal} />
            ))
          ) : (
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/30 p-4 text-center">
              <p className="text-sm text-zinc-500">No indices signals available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </TieredContent>
  );
}

/**
 * PRO TIER CONTENT: Stocks Trading Signals
 * Shows signals for most traded stocks with expected range
 */
export function ProSignals({ userTier, isSuperAdmin = false, signals }: TieredSignalsProps) {
  // Filter out indices (basic tier) to show stocks
  const indicesSymbols = ["SPY", "SPX", "NQ", "ES", "QQQ"];
  const stockSignals = signals.filter(s => !indicesSymbols.includes(s.symbol.toUpperCase()));

  return (
    <TieredContent
      tier="pro"
      userTier={userTier}
      isSuperAdmin={isSuperAdmin}
      title="Stocks Trading Signals"
      description="Most accurate bias and expected range for key stocks"
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          Includes expected range with large accuracy, entry/exit zones for key stocks, and high-potential options contracts.
        </p>
        <div className="grid gap-4">
          {stockSignals.length > 0 ? (
            stockSignals.slice(0, 10).map((signal) => (
              <ProSignalsCard key={signal.symbol} signal={signal} />
            ))
          ) : (
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/30 p-4 text-center">
              <p className="text-sm text-zinc-500">Stock signals updating... Check back soon!</p>
            </div>
          )}
        </div>
        {stockSignals.length > 10 && (
          <p className="text-xs text-zinc-500 text-center">
            +{stockSignals.length - 10} more stocks available
          </p>
        )}
      </div>
    </TieredContent>
  );
}

/**
 * ULTIMATE TIER CONTENT: Advanced Features
 * Shows Gamma Levels, Discord Access, Options Master
 */
export function UltimateContent({ userTier, isSuperAdmin = false }: { userTier: SubscriptionTier | undefined; isSuperAdmin?: boolean }) {
  return (
    <TieredContent
      tier="ultimate"
      userTier={userTier}
      isSuperAdmin={isSuperAdmin}
      title="Ultimate Features"
      description="Elite tools and Discord access for serious traders"
    >
      <UltimateSection userTier={userTier} isSuperAdmin={isSuperAdmin} />
    </TieredContent>
  );
}

/**
 * Current Plan Display Component
 */
export function CurrentPlanBadge({ tier }: { tier: SubscriptionTier | undefined }) {
  const tierInfo = {
    trial: { name: "Free Trial", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" },
    basic: { name: "Basic ($400)", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
    pro: { name: "Pro ($800)", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
    ultimate: { name: "Ultimate ($1500)", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
    none: { name: "No Plan", color: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30" },
  };

  const info = tierInfo[tier || "trial"];

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${info.color}`}>
      Current Plan: {info.name}
    </span>
  );
}
