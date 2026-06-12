"use client";

import { TradingViewComponent } from "@/app/api/tradingview-ideas/route";

interface ComponentsCardProps {
  component: TradingViewComponent;
}

export function ComponentsCard({ component }: ComponentsCardProps) {
  const isPositive = component.change >= 0;
  const changeColor = isPositive ? 'text-emerald-400' : 'text-rose-400';
  const changeIcon = isPositive ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  );

  return (
    <a
      href={component.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative overflow-hidden rounded-xl border border-zinc-700/50 bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 backdrop-blur-sm transition-all duration-300 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20 block"
    >
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/30">
              <span className="text-xs font-bold text-blue-300">{component.symbol}</span>
            </div>
            <div className="text-sm font-semibold text-zinc-100 truncate max-w-[150px]">{component.name}</div>
          </div>
          <div className={`flex items-center gap-1 ${changeColor}`}>
            {changeIcon}
            <span className="text-sm font-medium">{isPositive ? '+' : ''}{component.change.toFixed(2)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Weight: {component.weight.toFixed(1)}%</span>
          <span>View details →</span>
        </div>
      </div>
    </a>
  );
}
