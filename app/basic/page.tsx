import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME, getUserTier, hasBasicAccess, hasProAccess, hasUltimateAccess } from "@/lib/auth-types";
import { fetchSignalsFromSheet, type SignalRow } from "@/lib/signals";
import { BasicSignalsCard } from "@/components/subscription/BasicSignalsCard";
import { CurrentPlanBadge } from "@/components/subscription/TieredSignals";
import { TierBadge } from "@/components/subscription/TierGate";

export default async function BasicPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    redirect("/auth");
  }

  const userTier = getUserTier(session);
  const isSuperAdmin = session?.isSuperAdmin || false;

  // Access control: Check if user has Basic access
  if (!hasBasicAccess(userTier, isSuperAdmin)) {
    redirect("/pricing");
  }

  let signals: SignalRow[] = [];
  try {
    signals = await fetchSignalsFromSheet();
  } catch {
    signals = [];
  }

  const indicesSymbols = ["SPY", "SPX", "NQ", "ES", "QQQ"];
  const indicesSignals = signals.filter(s => indicesSymbols.includes(s.symbol.toUpperCase()));

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <DashboardHeader user={session} />
      <main className="min-h-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  Basic Plan Dashboard
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                  Market Indices Signals
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  Daily signals with bias for major market indices - SPY, SPX, NQ, ES, QQQ
                </p>
                <div className="mt-4 space-y-2">
                  <CurrentPlanBadge tier={userTier} />
                </div>
              </div>
            </div>
          </div>

          {/* Basic Signals */}
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
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
