import Link from "next/link";
import dynamic from 'next/dynamic';

const HeroVisualization = dynamic(() => import('@/components/3d/HeroVisualization'));
const GammaVisualization = dynamic(() => import('@/components/3d/GammaVisualization'));
const SignalFlowVisualization = dynamic(() => import('@/components/3d/SignalFlowVisualization'));

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10"></div>
        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(201, 162, 39, 0.1)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-100 leading-tight">
                The frontier of<br />
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  market intelligence.
                </span>
              </h1>
              <p className="mt-8 max-w-3xl mx-auto lg:mx-0 text-2xl md:text-3xl text-zinc-300 font-medium">
                Trade like institutions.<br />
                <span className="text-zinc-500">Without institutional pricing.</span>
              </p>
              <p className="mt-6 max-w-2xl mx-auto lg:mx-0 text-lg text-zinc-400">
                Real-time gamma exposure, options flow, and institutional-grade signals for serious traders.
              </p>
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/auth?tier=trial"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-10 py-5 text-lg font-semibold text-zinc-950 transition-all hover:from-amber-500 hover:to-orange-600 shadow-xl shadow-amber-500/30"
                >
                  Start Free Trial →
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800/50 px-10 py-5 text-lg font-semibold text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white"
                >
                  View Pricing
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <HeroVisualization />
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition Bar */}
      <div className="border-y border-[var(--border)] bg-[var(--surface)]/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-400">6+</div>
              <div className="text-sm text-zinc-400 mt-1">Major Indices</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">24/7</div>
              <div className="text-sm text-zinc-400 mt-1">Real-Time Signals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">Zero</div>
              <div className="text-sm text-zinc-400 mt-1">Latency</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">Pro</div>
              <div className="text-sm text-zinc-400 mt-1">Grade Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Everything You Need Section */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(201, 162, 39, 0.3)" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dots)" />
          </svg>
        </div>
        <div className="relative text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
            Everything you need.<br />
            <span className="text-zinc-500">Nothing you don't.</span>
          </h2>
          <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto">
            Institutional-grade market intelligence for serious traders who demand precision and reliability.
          </p>
        </div>

        <div className="space-y-16">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Real-Time Gamma Exposure</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Track dealer positioning across SPX, SPY, QQQ, NQ, ES. Real-time gamma exposure reveals market maker positions and key levels.
              </p>
              <p className="text-zinc-500">
                Gamma levels attract price. Know them before the market moves.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <div className="h-48 mb-4">
                  <GammaVisualization />
                </div>
                <div className="text-3xl font-bold text-amber-400 mb-2">Zero Gamma Flip</div>
                <div className="text-sm text-zinc-400">Identify critical inflection points</div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <div className="h-48 mb-4">
                  <SignalFlowVisualization />
                </div>
                <div className="text-3xl font-bold text-amber-400 mb-2">Instant Signal Delivery</div>
                <div className="text-sm text-zinc-400">No latency, no delays</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Instant Signal Alerts</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Zero latency. Real-time alerts on market movements and opportunities as they happen.
              </p>
              <p className="text-zinc-500">
                Never miss a trade. Continuous monitoring, instant delivery.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Complete Market Coverage</h3>
              <p className="text-lg text-zinc-400 mb-4">
                SPY, SPX, QQQ, NQ, ES, IWM, and actively traded equities. Real-time bias and key levels.
              </p>
              <p className="text-zinc-500">
                Index or equity. Signals adapt to your style.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <div className="h-48 mb-4">
                  <HeroVisualization />
                </div>
                <div className="text-3xl font-bold text-amber-400 mb-2">Major Indices</div>
                <div className="text-sm text-zinc-400">Indices, ETFs, and stocks</div>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <svg className="w-full h-32 mb-4" viewBox="0 0 400 100">
                  <defs>
                    <filter id="shadow3d4" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <rect x="20" y="10" width="360" height="80" rx="8" fill="none" stroke="#c9a227" strokeWidth="3" opacity="0.4" filter="url(#shadow3d4)" />
                  <rect x="30" y="20" width="100" height="60" rx="4" fill="#c9a227" opacity="0.15" filter="url(#shadow3d4)" />
                  <rect x="140" y="20" width="100" height="60" rx="4" fill="#f97316" opacity="0.2" filter="url(#shadow3d4)" />
                  <rect x="250" y="20" width="100" height="60" rx="4" fill="#c9a227" opacity="0.15" filter="url(#shadow3d4)" />
                  <path d="M50,50 L80,35 L110,55 L140,40 L170,60" stroke="#c9a227" strokeWidth="3" fill="none" filter="url(#shadow3d4)" />
                  <path d="M160,50 L190,45 L220,55 L250,40 L280,50" stroke="#f97316" strokeWidth="3" fill="none" filter="url(#shadow3d4)" />
                  <path d="M270,50 L300,35 L330,55 L360,45" stroke="#c9a227" strokeWidth="3" fill="none" filter="url(#shadow3d4)" />
                </svg>
                <div className="text-3xl font-bold text-amber-400 mb-2">TradingView Integration</div>
                <div className="text-sm text-zinc-400">Seamless workflow</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">TradingView Integration</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Visualize gamma levels, support/resistance, and signal flow directly on your charts. One platform.
              </p>
              <p className="text-zinc-500">
                Seamless workflow. Works with your existing tools.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Deep Knowledge Base</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Understand why signals work and how to interpret them in any market condition.
              </p>
              <p className="text-zinc-500">
                From basics to advanced gamma theory. Trade with confidence.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <svg className="w-full h-32 mb-4" viewBox="0 0 400 100">
                  <defs>
                    <filter id="shadow3d5" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <rect x="50" y="15" width="80" height="70" rx="4" fill="none" stroke="#c9a227" strokeWidth="3" opacity="0.5" filter="url(#shadow3d5)" />
                  <line x1="70" y1="35" x2="110" y2="35" stroke="#c9a227" strokeWidth="3" opacity="0.6" filter="url(#shadow3d5)" />
                  <line x1="70" y1="50" x2="110" y2="50" stroke="#c9a227" strokeWidth="3" opacity="0.6" filter="url(#shadow3d5)" />
                  <line x1="70" y1="65" x2="100" y2="65" stroke="#c9a227" strokeWidth="3" opacity="0.6" filter="url(#shadow3d5)" />
                  <rect x="160" y="15" width="80" height="70" rx="4" fill="none" stroke="#f97316" strokeWidth="3" opacity="0.5" filter="url(#shadow3d5)" />
                  <line x1="180" y1="35" x2="220" y2="35" stroke="#f97316" strokeWidth="3" opacity="0.6" filter="url(#shadow3d5)" />
                  <line x1="180" y1="50" x2="210" y2="50" stroke="#f97316" strokeWidth="3" opacity="0.6" filter="url(#shadow3d5)" />
                  <line x1="180" y1="65" x2="220" y2="65" stroke="#f97316" strokeWidth="3" opacity="0.6" filter="url(#shadow3d5)" />
                  <rect x="270" y="15" width="80" height="70" rx="4" fill="none" stroke="#c9a227" strokeWidth="3" opacity="0.5" filter="url(#shadow3d5)" />
                  <line x1="290" y1="35" x2="330" y2="35" stroke="#c9a227" strokeWidth="3" opacity="0.6" filter="url(#shadow3d5)" />
                  <line x1="290" y1="50" x2="320" y2="50" stroke="#c9a227" strokeWidth="3" opacity="0.6" filter="url(#shadow3d5)" />
                  <line x1="290" y1="65" x2="330" y2="65" stroke="#c9a227" strokeWidth="3" opacity="0.6" filter="url(#shadow3d5)" />
                </svg>
                <div className="text-3xl font-bold text-amber-400 mb-2">Learn & Grow</div>
                <div className="text-sm text-zinc-400">Comprehensive education resources</div>
              </div>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <svg className="w-full h-32 mb-4" viewBox="0 0 400 100">
                  <defs>
                    <filter id="shadow3d6" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <circle cx="80" cy="50" r="20" fill="#c9a227" opacity="0.3" filter="url(#shadow3d6)" />
                  <circle cx="160" cy="40" r="18" fill="#f97316" opacity="0.4" filter="url(#shadow3d6)" />
                  <circle cx="240" cy="55" r="22" fill="#c9a227" opacity="0.3" filter="url(#shadow3d6)" />
                  <circle cx="320" cy="45" r="19" fill="#f97316" opacity="0.4" filter="url(#shadow3d6)" />
                  <line x1="100" y1="50" x2="142" y2="40" stroke="#c9a227" strokeWidth="3" opacity="0.5" filter="url(#shadow3d6)" />
                  <line x1="178" y1="40" x2="218" y2="55" stroke="#f97316" strokeWidth="3" opacity="0.5" filter="url(#shadow3d6)" />
                  <line x1="262" y1="55" x2="301" y2="45" stroke="#c9a227" strokeWidth="3" opacity="0.5" filter="url(#shadow3d6)" />
                  <circle cx="80" cy="50" r="8" fill="#c9a227" filter="url(#shadow3d6)" />
                  <circle cx="160" cy="40" r="7" fill="#f97316" filter="url(#shadow3d6)" />
                  <circle cx="240" cy="55" r="9" fill="#c9a227" filter="url(#shadow3d6)" />
                  <circle cx="320" cy="45" r="8" fill="#f97316" filter="url(#shadow3d6)" />
                </svg>
                <div className="text-3xl font-bold text-amber-400 mb-2">Discord Community</div>
                <div className="text-sm text-zinc-400">Connect with fellow traders</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Trader Community</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Join our Discord. Share insights, discuss markets, learn from experienced traders.
              </p>
              <p className="text-zinc-500">
                Trading solo? Connect. Accelerate your learning.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="dots2" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="rgba(201, 162, 39, 0.3)" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#dots2)" />
          </svg>
        </div>
        <div className="relative text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
            Advanced Trading Tools.
          </h2>
          <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto">
            Professional-grade features for traders seeking profitability and precision.
          </p>
        </div>

        <div className="space-y-16">
          {/* Feature 7 - Price Forecasting */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Price Forecasting</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Predictive algorithms forecast price movements based on gamma, structure, and patterns. Data-driven projections.
              </p>
              <p className="text-zinc-500">
                Probabilistic price targets. Plan entries and exits with confidence.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <div className="h-48 mb-4">
                  <SignalFlowVisualization />
                </div>
                <div className="text-3xl font-bold text-amber-400 mb-2">AI-Powered Forecasts</div>
                <div className="text-sm text-zinc-400">Predictive price projections</div>
              </div>
            </div>
          </div>

          {/* Feature 8 - Expected Range */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <div className="h-48 mb-4">
                  <GammaVisualization />
                </div>
                <div className="text-3xl font-bold text-amber-400 mb-2">Expected Range</div>
                <div className="text-sm text-zinc-400">Daily price boundaries</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Expected Range</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Know the daily trading range. Identify optimal entries, stops, and targets.
              </p>
              <p className="text-zinc-500">
                Based on volatility, gamma, and conditions. Realistic boundaries.
              </p>
            </div>
          </div>

          {/* Feature 9 - 90% Accuracy */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">90% Bias Accuracy</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Directional bias signals: 90% accuracy in historical testing. Trade with confidence.
              </p>
              <p className="text-zinc-500">
                Verified across conditions. Institutional-grade data, proprietary algorithms.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
              <div className="relative">
                <svg className="w-full h-40 mb-4" viewBox="0 0 400 160">
                  <defs>
                    <filter id="shadow3d9" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <circle cx="200" cy="80" r="60" fill="none" stroke="#22c55e" strokeWidth="5" opacity="0.3" filter="url(#shadow3d9)" />
                  <circle cx="200" cy="80" r="60" fill="none" stroke="#22c55e" strokeWidth="5" strokeDasharray="340" strokeDashoffset="34" transform="rotate(-90 200 80)" filter="url(#shadow3d9)" />
                  <text x="200" y="75" textAnchor="middle" fill="#22c55e" fontSize="32" fontWeight="bold">90%</text>
                  <text x="200" y="100" textAnchor="middle" fill="#9ca3af" fontSize="12" fontWeight="bold">Accuracy</text>
                  <circle cx="200" cy="80" r="45" fill="#22c55e" opacity="0.15" filter="url(#shadow3d9)" />
                </svg>
                <div className="text-3xl font-bold text-green-400 mb-2">Proven Accuracy</div>
                <div className="text-sm text-zinc-400">Verified track record</div>
              </div>
            </div>
          </div>

          {/* Feature 10 - Swings Master */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <div className="h-48 mb-4">
                  <SignalFlowVisualization />
                </div>
                <div className="text-3xl font-bold text-amber-400 mb-2">Swings Master</div>
                <div className="text-sm text-zinc-400">Identify swing highs and lows</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Swings Master</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Auto-identify swing highs and lows across timeframes. Perfect for trend and structure traders.
              </p>
              <p className="text-zinc-500">
                Real-time detection. Draw trend lines, identify S/R, time entries perfectly.
              </p>
            </div>
          </div>

          {/* Feature 11 - Next Day Expirations */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Expiration Tracker</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Track tomorrow's options expirations. Know strikes with max open interest and gamma shifts.
              </p>
              <p className="text-zinc-500">
                Critical for pin risk and manipulation. Stay ahead of the gamma flip.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <div className="h-48 mb-4">
                  <GammaVisualization />
                </div>
                <div className="text-3xl font-bold text-amber-400 mb-2">Expiration Tracker</div>
                <div className="text-sm text-zinc-400">Tomorrow's key levels</div>
              </div>
            </div>
          </div>

          {/* Feature 12 - Options Master */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <div className="h-48 mb-4">
                  <HeroVisualization />
                </div>
                <div className="text-3xl font-bold text-amber-400 mb-2">Options Master Project</div>
                <div className="text-sm text-zinc-400">For profitability seekers</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Options Master</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Track IV, skew, and find optimal strategies for current conditions. Profit-focused analysis.
              </p>
              <p className="text-zinc-500">
                Directional to complex spreads. Data and insights to profit in options.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 mb-6">
            Markets run on algorithms.
          </h2>
          <p className="text-2xl md:text-3xl text-zinc-400 mb-4">
            Shouldn't you?
          </p>
          <p className="mt-6 text-lg text-zinc-500 max-w-2xl mx-auto mb-12">
            Join traders who elevated their game with institutional intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth?tier=trial"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-12 py-5 text-lg font-semibold text-zinc-950 transition-all hover:from-amber-500 hover:to-orange-600 shadow-xl shadow-amber-500/30"
            >
              Start Your Free Trial →
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800/50 px-12 py-5 text-lg font-semibold text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      {/* Final Trust Section */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)]/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-amber-400 font-semibold mb-2">Cancel Anytime</div>
              <div className="text-sm text-zinc-500">No long-term commitments</div>
            </div>
            <div>
              <div className="text-amber-400 font-semibold mb-2">24/7 Support</div>
              <div className="text-sm text-zinc-500">We're here when you need us</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
