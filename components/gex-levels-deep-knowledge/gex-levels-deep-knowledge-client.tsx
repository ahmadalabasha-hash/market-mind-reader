"use client";

import { useState } from "react";

interface GexLevel {
  level: number;
  status: "bullish" | "bearish" | "neutral";
  description: string;
  gammaExposure: number;
  putGamma: number;
  callGamma: number;
}

const gexLevelsData: GexLevel[] = [
  {
    level: 4000,
    status: "bearish",
    description: "Major resistance zone with significant call gamma concentration",
    gammaExposure: -2.5,
    putGamma: 1.2,
    callGamma: -3.7,
  },
  {
    level: 3950,
    status: "neutral",
    description: "Neutral gamma zone with balanced put/call exposure",
    gammaExposure: 0.3,
    putGamma: 1.8,
    callGamma: 2.1,
  },
  {
    level: 3900,
    status: "bullish",
    description: "Strong support level with heavy put gamma accumulation",
    gammaExposure: 3.2,
    putGamma: 4.1,
    callGamma: 0.9,
  },
  {
    level: 3850,
    status: "bullish",
    description: "Key support level with maximum put gamma concentration",
    gammaExposure: 4.8,
    putGamma: 5.2,
    callGamma: 0.4,
  },
  {
    level: 3800,
    status: "neutral",
    description: "Lower support boundary with moderate gamma profile",
    gammaExposure: 1.1,
    putGamma: 2.3,
    callGamma: 1.2,
  },
];

export default function GexLevelsDeepKnowledgeClient() {
  const [selectedLevel, setSelectedLevel] = useState<GexLevel | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(3925);
  const [activeTab, setActiveTab] = useState<"overview" | "concepts" | "signals" | "advanced">("overview");

  const getSignalForPrice = (price: number) => {
    const relevantLevel = gexLevelsData
      .filter((level) => Math.abs(level.level - price) < 75)
      .sort((a, b) => Math.abs(a.level - price) - Math.abs(b.level - price))[0];

    if (!relevantLevel) return { signal: "neutral", strength: 0, description: "No clear GEX signal" };

    const distance = price - relevantLevel.level;
    const strength = Math.max(0, 100 - Math.abs(distance));

    if (relevantLevel.status === "bullish" && distance >= 0) {
      return {
        signal: "bullish",
        strength,
        description: `Price above bullish GEX level at ${relevantLevel.level}`,
      };
    } else if (relevantLevel.status === "bearish" && distance <= 0) {
      return {
        signal: "bearish",
        strength,
        description: `Price below bearish GEX level at ${relevantLevel.level}`,
      };
    } else {
      return {
        signal: "neutral",
        strength: strength * 0.5,
        description: `Price near neutral GEX level at ${relevantLevel.level}`,
      };
    }
  };

  const currentSignal = getSignalForPrice(currentPrice);

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-8">
        <h2 className="text-2xl font-semibold text-zinc-100 mb-4">Current GEX Analysis</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Current Price</p>
            <p className="mt-2 text-3xl font-bold text-zinc-100">${currentPrice}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">GEX Signal</p>
            <p className="mt-2 text-3xl font-bold text-zinc-100 capitalize">{currentSignal.signal}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Signal Strength</p>
            <p className="mt-2 text-3xl font-bold text-zinc-100">{currentSignal.strength.toFixed(0)}%</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-zinc-400">{currentSignal.description}</p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-8">
        <h3 className="text-xl font-semibold text-zinc-100 mb-6">Active GEX Levels</h3>
        <div className="space-y-4">
          {gexLevelsData.map((level) => (
            <div
              key={level.level}
              className={`rounded-xl border p-6 transition-all cursor-pointer hover:border-zinc-500 ${
                selectedLevel?.level === level.level
                  ? "border-zinc-500 bg-[var(--surface)]/60"
                  : "border-[var(--border)] bg-[var(--background)]"
              }`}
              onClick={() => setSelectedLevel(level)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-zinc-100">{level.level}</p>
                    <p className="text-xs text-zinc-500">Strike Price</p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      level.status === "bullish"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : level.status === "bearish"
                        ? "bg-rose-500/15 text-rose-400"
                        : "bg-zinc-500/15 text-zinc-400"
                    }`}
                  >
                    {level.status.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-zinc-100">GEX: {level.gammaExposure.toFixed(2)}</p>
                  <p className="text-xs text-zinc-500">Gamma Exposure</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-zinc-400">{level.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500">Put Gamma:</span>
                  <span className="ml-2 text-emerald-400 font-mono">{level.putGamma.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Call Gamma:</span>
                  <span className="ml-2 text-rose-400 font-mono">{level.callGamma.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConcepts = () => (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-8">
        <h2 className="text-2xl font-semibold text-zinc-100 mb-6">Understanding GEX (Gamma Exposure)</h2>
        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">What is Gamma Exposure?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Gamma Exposure (GEX) measures the total gamma held by market participants at various strike prices.
                Gamma represents the rate of change of an option's delta relative to the underlying asset price.
                When dealers are net long gamma, they must buy when the market drops and sell when it rises,
                creating a stabilizing effect. Conversely, net short gamma leads to destabilizing feedback loops.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">How GEX Levels Work</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                GEX levels identify price points where significant gamma exposure is concentrated.
                These levels act as magnets or repellers for price action depending on whether the gamma
                is net long (bullish/supportive) or net short (bearish/resistant). Understanding these levels
                helps predict potential support and resistance zones based on options market positioning.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">Put vs Call Gamma</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Put gamma represents gamma from put options, which tends to be stabilizing as market makers
                hedge by selling underlying when prices fall. Call gamma from call options can have different
                effects depending on positioning. The balance between put and call gamma at each level
                determines the overall directional bias and potential price reaction.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-3">Practical Applications</h3>
              <ul className="text-sm text-zinc-400 leading-relaxed space-y-2">
                <li>• Identify key support/resistance levels before they're tested</li>
                <li>• Understand potential market volatility based on gamma positioning</li>
                <li>• Time entries and exits based on expected dealer hedging flows</li>
                <li>• Assess market structure and participant positioning</li>
                <li>• Predict potential mean reversion vs trend continuation scenarios</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-8">
        <h3 className="text-xl font-semibold text-zinc-100 mb-6">GEX Level Interpretation Guide</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <h4 className="font-semibold text-emerald-400">Bullish GEX Levels</h4>
            </div>
            <p className="text-sm text-zinc-400">
              Levels with positive net gamma exposure. Market makers are long gamma and provide liquidity,
              creating support and potentially dampening volatility. Price tends to find support at these levels.
            </p>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <h4 className="font-semibold text-rose-400">Bearish GEX Levels</h4>
            </div>
            <p className="text-sm text-zinc-400">
              Levels with negative net gamma exposure. Market makers are short gamma and must hedge against
              price moves, potentially accelerating momentum and creating resistance.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-500/20 bg-zinc-500/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-zinc-500" />
              <h4 className="font-semibold text-zinc-400">Neutral GEX Levels</h4>
            </div>
            <p className="text-sm text-zinc-400">
              Levels with balanced gamma exposure. Price action depends more on other factors like order flow,
              fundamentals, or market sentiment rather than dealer hedging pressure.
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <h4 className="font-semibold text-amber-400">Gamma Flip Zones</h4>
            </div>
            <p className="text-sm text-zinc-400">
              Areas where gamma exposure changes sign. These are critical inflection points where market
              dynamics can shift rapidly from stabilizing to destabilizing or vice versa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSignals = () => (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-8">
        <h2 className="text-2xl font-semibold text-zinc-100 mb-6">Interactive Signal Simulator</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Simulate Price at Different Levels</label>
            <input
              type="range"
              min="3750"
              max="4100"
              step="25"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(Number(e.target.value))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-2">
              <span>3750</span>
              <span className="text-lg font-bold text-zinc-100">${currentPrice}</span>
              <span>4100</span>
            </div>
          </div>
          <div
            className={`rounded-xl border p-6 ${
              currentSignal.signal === "bullish"
                ? "border-emerald-500/30 bg-emerald-500/10"
                : currentSignal.signal === "bearish"
                ? "border-rose-500/30 bg-rose-500/10"
                : "border-zinc-500/30 bg-zinc-500/10"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold capitalize text-zinc-100">Current Signal: {currentSignal.signal}</h3>
              <span className="text-3xl font-bold text-zinc-100">{currentSignal.strength.toFixed(0)}%</span>
            </div>
            <p className="text-sm text-zinc-400">{currentSignal.description}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-8">
        <h3 className="text-xl font-semibold text-zinc-100 mb-6">Signal Logic Explanation</h3>
        <div className="space-y-4">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <h4 className="font-medium text-zinc-100 mb-2">Bullish Signal Conditions</h4>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Price is above a bullish GEX level</li>
              <li>• Positive net gamma exposure at nearby levels</li>
              <li>• Put gamma exceeds call gamma significantly</li>
              <li>• Signal strength increases with proximity to level</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <h4 className="font-medium text-zinc-100 mb-2">Bearish Signal Conditions</h4>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Price is below a bearish GEX level</li>
              <li>• Negative net gamma exposure at nearby levels</li>
              <li>• Call gamma exceeds put gamma significantly</li>
              <li>• Signal strength increases with proximity to level</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <h4 className="font-medium text-zinc-100 mb-2">Neutral Signal Conditions</h4>
            <ul className="text-sm text-zinc-400 space-y-1">
              <li>• Price is near neutral GEX levels</li>
              <li>• Balanced put/call gamma exposure</li>
              <li>• No clear directional bias from gamma</li>
              <li>• Other factors may drive price action</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvanced = () => (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-8">
        <h2 className="text-2xl font-semibold text-zinc-100 mb-6">Advanced GEX Analysis</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Gamma Profile Statistics</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Net GEX</p>
                <p className="mt-2 text-2xl font-bold text-zinc-100">
                  {gexLevelsData.reduce((sum, level) => sum + level.gammaExposure, 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Put Gamma</p>
                <p className="mt-2 text-2xl font-bold text-emerald-400">
                  {gexLevelsData.reduce((sum, level) => sum + level.putGamma, 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Call Gamma</p>
                <p className="mt-2 text-2xl font-bold text-rose-400">
                  {gexLevelsData.reduce((sum, level) => sum + level.callGamma, 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Gamma Imbalance</p>
                <p className="mt-2 text-2xl font-bold text-zinc-100">
                  {(
                    gexLevelsData.reduce((sum, level) => sum + level.putGamma, 0) -
                    gexLevelsData.reduce((sum, level) => sum + level.callGamma, 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Level-by-Level Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-4 py-3 text-left font-semibold text-zinc-300">Level</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-300">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-300">Net GEX</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-300">Put Gamma</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-300">Call Gamma</th>
                    <th className="px-4 py-3 text-left font-semibold text-zinc-300">Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {gexLevelsData.map((level) => (
                    <tr key={level.level} className="border-b border-[var(--border)] hover:bg-[var(--surface)]/20">
                      <td className="px-4 py-3 font-semibold text-zinc-100">{level.level}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            level.status === "bullish"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : level.status === "bearish"
                              ? "bg-rose-500/15 text-rose-400"
                              : "bg-zinc-500/15 text-zinc-400"
                          }`}
                        >
                          {level.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-mono ${level.gammaExposure >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {level.gammaExposure.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-400">{level.putGamma.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-rose-400">{level.callGamma.toFixed(2)}</td>
                      <td className="px-4 py-3 font-mono text-zinc-300">
                        {Math.abs(currentPrice - level.level).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-8">
        <h3 className="text-xl font-semibold text-zinc-100 mb-6">Professional Analysis Tools</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <button
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 text-left hover:border-zinc-500 transition"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h4 className="font-semibold text-zinc-100">GEX Flow Analysis</h4>
            </div>
            <p className="text-sm text-zinc-400">
              Track real-time changes in gamma exposure and identify institutional positioning shifts
            </p>
          </button>
          <button className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 text-left hover:border-zinc-500 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <h4 className="font-semibold text-zinc-100">Gamma Exposure Profile</h4>
            </div>
            <p className="text-sm text-zinc-400">
              Visualize the complete gamma profile across all strikes and expirations
            </p>
          </button>
          <button className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 text-left hover:border-zinc-500 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <h4 className="font-semibold text-zinc-100">Dealer Positioning Tracker</h4>
            </div>
            <p className="text-sm text-zinc-400">
              Monitor dealer hedging requirements and potential market impact
            </p>
          </button>
          <button className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-6 text-left hover:border-zinc-500 transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-zinc-500" />
              <h4 className="font-semibold text-zinc-100">Historical GEX Analysis</h4>
            </div>
            <p className="text-sm text-zinc-400">
              Analyze how GEX levels have performed historically as support/resistance
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Advanced market intelligence
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            GEX Levels Deep Knowledge
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Comprehensive analysis of Gamma Exposure levels, options market positioning, and their impact on price
            action. Professional-grade tools for institutional-level market understanding.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2 border-b border-[var(--border)]">
            {["overview", "concepts", "signals", "advanced"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 text-sm font-medium capitalize transition ${
                  activeTab === tab
                    ? "border-b-2 border-zinc-100 text-zinc-100"
                    : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "overview" && renderOverview()}
        {activeTab === "concepts" && renderConcepts()}
        {activeTab === "signals" && renderSignals()}
        {activeTab === "advanced" && renderAdvanced()}

        <div className="mt-12 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-zinc-100">Unlock Premium GEX Analysis</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Get real-time GEX data, advanced analytics, and professional-grade market intelligence tools
              </p>
            </div>
            <div className="flex gap-4">
              <button className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-6 py-3 text-sm font-medium text-zinc-100 hover:border-zinc-500 transition">
                Learn More
              </button>
              <button className="rounded-lg bg-amber-500 px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-amber-400 transition">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-8">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Key Features</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-zinc-100">Real-time GEX Tracking</p>
                <p className="text-sm text-zinc-400">Monitor gamma exposure changes as they happen</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-zinc-100">Multi-Asset Coverage</p>
                <p className="text-sm text-zinc-400">GEX analysis across indices, stocks, and ETFs</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-zinc-100">Historical Performance</p>
                <p className="text-sm text-zinc-400">Backtest GEX levels as support/resistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}