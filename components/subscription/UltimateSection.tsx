"use client";

import { useState } from "react";
import { GammaLevelsOverlay } from "@/components/dashboard/gamma-levels-overlay";
import { AdvancedChart } from "@/components/dashboard/trading-view-section";

interface UltimateSectionProps {
  userTier: string | undefined;
  isSuperAdmin?: boolean;
}

/**
 * Ultimate Plan Section - Uses existing gamma levels and TradingView components
 */
export function UltimateSection({ userTier, isSuperAdmin = false }: UltimateSectionProps) {
  const [chartSymbol, setChartSymbol] = useState("SPY");

  const handleSymbolChange = (newSymbol: string) => {
    setChartSymbol(newSymbol);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">Ultimate Dashboard</h2>
          <p className="text-sm text-zinc-400 mt-1">Advanced analytics with TradingView integration</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs text-amber-400 font-medium">ULTIMATE ACCESS</span>
        </div>
      </div>

      {/* Gamma Levels Overlay - Primary symbol control */}
      <GammaLevelsOverlay theme="midnight" symbol={chartSymbol} onSymbolChange={handleSymbolChange} />

      {/* TradingView Advanced Chart */}
      <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
        <div className="border-b border-zinc-700/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">TradingView Advanced Chart</h3>
              <p className="text-xs text-zinc-500">Real-time market data</p>
            </div>
          </div>
        </div>
        <div className="h-[600px]">
          <AdvancedChart symbol={chartSymbol} onSymbolChange={handleSymbolChange} />
        </div>
        <div className="px-6 py-3 border-t border-zinc-700/50 bg-zinc-900/50">
          <p className="text-xs text-zinc-500">
            All displayed pricing comes directly from TradingView. Use the chart symbol search to switch instruments. Data by TradingView.
          </p>
        </div>
      </div>

      {/* Expected Range - Gamma Style */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-orange-500/5 overflow-hidden">
        <div className="border-b border-amber-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/30">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-100">Expected Range</h3>
              <p className="text-xs text-amber-400/70">Projected price movement</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lowest Expected */}
            <div className="rounded-xl bg-zinc-900/50 border border-rose-500/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Lowest Expected</span>
              </div>
              <div className="text-3xl font-bold text-rose-400">5125</div>
            </div>
            {/* Highest Expected */}
            <div className="rounded-xl bg-zinc-900/50 border border-emerald-500/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Highest Expected</span>
              </div>
              <div className="text-3xl font-bold text-emerald-400">5250</div>
            </div>
          </div>
        </div>
      </div>

      {/* Options Master Link */}
      <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-100">Options Master</h3>
              <p className="text-sm text-purple-400/70">Advanced options strategies and picks</p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = '/options-master/history'}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-zinc-950 font-semibold hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20"
          >
            Open Options Master
          </button>
        </div>
      </div>
    </div>
  );
}
