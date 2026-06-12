"use client";

import { TradingViewTechnical } from "@/app/api/tradingview-ideas/route";

interface TechnicalsCardProps {
  technical: TradingViewTechnical;
}

export function TechnicalsCard({ technical }: TechnicalsCardProps) {
  const signalColor = technical.signal === 'buy' ? 'text-emerald-400' : technical.signal === 'sell' ? 'text-rose-400' : 'text-amber-400';
  const signalBg = technical.signal === 'buy' ? 'bg-emerald-500/10 border-emerald-500/20' : technical.signal === 'sell' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20';

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 hover:shadow-lg">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-zinc-300">{technical.indicator}</div>
          <div className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase border ${signalBg} ${signalColor}`}>
            {technical.signal}
          </div>
        </div>
        <div className="text-2xl font-bold text-zinc-100">{technical.value}</div>
      </div>
    </div>
  );
}
