"use client";

import { SignalRow } from "@/lib/signals";

interface BasicSignalsCardProps {
  signal: SignalRow;
}

/**
 * Basic Plan Signal Card - Premium design with icons
 * Shows bias, entry price, conditions for indices (SPX, SPY, QQQ, ES, NQ)
 */
export function BasicSignalsCard({ signal }: BasicSignalsCardProps) {
  const isBullish = signal.bias?.toLowerCase().includes("bull");
  const isBearish = signal.bias?.toLowerCase().includes("bear");

  const biasColor = isBullish ? "text-emerald-400" : isBearish ? "text-rose-400" : "text-amber-400";
  const biasBg = isBullish ? "bg-emerald-500/10 border-emerald-500/20" : isBearish ? "bg-rose-500/10 border-rose-500/20" : "bg-amber-500/10 border-amber-500/20";
  const biasIcon = isBullish ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ) : isBearish ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const directionMessage = isBullish ? "Only look for longs" : isBearish ? "Only look for shorts" : "Wait for confirmation";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/20">
      {/* Header with symbol and bias */}
      <div className="border-b border-zinc-700/50 bg-zinc-900/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <span className="text-lg font-bold text-blue-300">{signal.symbol}</span>
            </div>
            <div>
              <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border ${biasBg} ${biasColor}`}>
                {biasIcon}
                <span className="text-sm font-semibold uppercase tracking-wide">{signal.bias || "NEUTRAL"}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Last Updated</div>
            <div className="text-sm text-zinc-400">{signal.date}</div>
          </div>
        </div>
      </div>

      {/* Direction message */}
      <div className={`px-6 py-3 border-b border-zinc-700/30 ${isBullish ? 'bg-emerald-500/5' : isBearish ? 'bg-rose-500/5' : 'bg-amber-500/5'}`}>
        <div className="flex items-center gap-2">
          <svg className={`w-4 h-4 ${biasColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-sm font-medium ${biasColor}`}>{directionMessage}</span>
        </div>
      </div>

      {/* Signal details */}
      <div className="px-6 py-5 space-y-4">
        {/* Entry Price */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 border border-zinc-700">
            <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Entry Price</div>
            <div className="text-lg font-semibold text-zinc-100">{signal.keyLevel || "Calculating..."}</div>
          </div>
        </div>

        {/* Entry Zone */}
        {(signal as any).entryZone && (
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Entry Zone</div>
              <div className="text-sm font-medium text-emerald-300">{(signal as any).entryZone}</div>
            </div>
          </div>
        )}

        {/* Conditions */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
            <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Conditions</div>
            <div className="text-sm text-zinc-300 leading-relaxed">
              {(signal as any).conditions || "Enter on dip near GEX price"}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with GEX level indicator */}
      <div className="border-t border-zinc-700/50 bg-zinc-900/30 px-6 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>GEX Level: {(signal as any).gexLevel || "Loading..."}</span>
          </div>
          <div className="flex items-center gap-1 text-zinc-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
