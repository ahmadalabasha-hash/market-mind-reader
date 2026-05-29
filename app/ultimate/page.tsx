import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME, getUserTier, hasUltimateAccess } from "@/lib/auth-types";
import { fetchSignalsFromSheet, type SignalRow } from "@/lib/signals";
import { BasicSignalsCard } from "@/components/subscription/BasicSignalsCard";
import { ProSignalsCard } from "@/components/subscription/ProSignalsCard";
import { UltimateSection } from "@/components/subscription/UltimateSection";
import { CurrentPlanBadge } from "@/components/subscription/TieredSignals";

export default async function UltimatePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    redirect("/auth");
  }

  const userTier = getUserTier(session);
  const isSuperAdmin = session?.isSuperAdmin || false;

  // Access control: Check if user has Ultimate access
  if (!hasUltimateAccess(userTier, isSuperAdmin)) {
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
  const stockSignals = signals.filter(s => !indicesSymbols.includes(s.symbol.toUpperCase()));

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
                  Ultimate Plan Dashboard
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                  Advanced Trading Suite
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-400">
                  Market signals, GEX levels, and TradingView Advanced Chart integration
                </p>
                <div className="mt-4 space-y-2">
                  <CurrentPlanBadge tier={userTier} />
                </div>
              </div>
            </div>
          </div>

          {/* Ultimate Section - Gamma Levels + TradingView Chart */}
          <UltimateSection userTier={userTier} isSuperAdmin={isSuperAdmin} />

          {/* AI Forecast Section - Ultimate Only */}
          <div className="mt-8">
            <div className="rounded-xl border border-zinc-700 bg-zinc-800/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100">AI Sales Forecast</h2>
                  <p className="text-sm text-zinc-400">TimesFM-powered time series forecasting</p>
                </div>
                <a
                  href="/forecast"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 text-sm font-semibold text-zinc-950 transition-all hover:from-amber-500 hover:to-orange-600"
                >
                  View Forecast →
                </a>
              </div>
            </div>
          </div>

          {/* Basic + Pro Signals */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Signals - Market Indices */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-100">Market Indices Signals</h2>
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

            {/* Pro Signals - Stocks */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-zinc-100">Stocks Trading Signals</h2>
              <p className="text-sm text-zinc-400">
                Includes expected range with large accuracy, entry/exit zones for key stocks.
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
          </div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}
