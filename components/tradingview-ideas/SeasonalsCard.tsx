"use client";

import { TradingViewSeasonal } from "@/app/api/tradingview-ideas/route";

interface SeasonalsCardProps {
  seasonal: TradingViewSeasonal;
}

export function SeasonalsCard({ seasonal }: SeasonalsCardProps) {
  const isPositive = seasonal.performance >= 0;
  const performanceColor = isPositive ? 'text-emerald-400' : 'text-rose-400';
  const performanceBg = isPositive ? 'bg-emerald-500/10' : 'bg-rose-500/10';

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 hover:shadow-lg">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-zinc-300">{seasonal.period}</div>
          <div className={`px-3 py-1 rounded-lg text-sm font-bold ${performanceBg} ${performanceColor}`}>
            {isPositive ? '+' : ''}{seasonal.performance.toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${Math.min(Math.abs(seasonal.performance) * 10, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
