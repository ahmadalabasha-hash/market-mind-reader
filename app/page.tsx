import Link from "next/link";

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
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-100 leading-tight">
              The frontier of<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                market intelligence.
              </span>
            </h1>
            <p className="mt-8 max-w-3xl mx-auto text-2xl md:text-3xl text-zinc-300 font-medium">
              Trade like institutions.<br />
              <span className="text-zinc-500">Without institutional pricing.</span>
            </p>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-zinc-400">
              Real-time gamma exposure, options flow, and institutional-grade signals for serious traders.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
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
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Real-Time Gamma Exposure Analysis</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Track dealer positioning and gamma levels across SPX, SPY, QQQ, NQ, ES and major indices. Our proprietary algorithms calculate gamma exposure in real-time, revealing where market makers are positioned and potential support/resistance levels.
              </p>
              <p className="text-zinc-500">
                Understand the forces driving intraday price action. Gamma levels act as magnetic attractors for price — know where they are before the market moves.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <svg className="w-full h-32 mb-4" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="gammaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{stopColor: '#c9a227', stopOpacity: 0.3}} />
                      <stop offset="50%" style={{stopColor: '#f97316', stopOpacity: 0.6}} />
                      <stop offset="100%" style={{stopColor: '#c9a227', stopOpacity: 0.3}} />
                    </linearGradient>
                    <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <path d="M0,50 Q50,30 100,50 T200,50 T300,50 T400,50" stroke="url(#gammaGradient)" strokeWidth="4" fill="none" filter="url(#shadow3d)" />
                  <path d="M0,50 Q50,70 100,50 T200,50 T300,50 T400,50" stroke="url(#gammaGradient)" strokeWidth="4" fill="none" opacity="0.5" filter="url(#shadow3d)" />
                  <circle cx="100" cy="50" r="8" fill="#c9a227" filter="url(#shadow3d)" />
                  <circle cx="200" cy="50" r="8" fill="#f97316" filter="url(#shadow3d)" />
                  <circle cx="300" cy="50" r="8" fill="#c9a227" filter="url(#shadow3d)" />
                </svg>
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
                <svg className="w-full h-32 mb-4" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{stopColor: '#c9a227', stopOpacity: 0.2}} />
                      <stop offset="100%" style={{stopColor: '#f97316', stopOpacity: 0.8}} />
                    </linearGradient>
                    <filter id="shadow3d2" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <rect x="50" y="20" width="60" height="40" rx="4" fill="url(#flowGradient)" opacity="0.6" filter="url(#shadow3d2)" />
                  <rect x="130" y="35" width="80" height="30" rx="4" fill="url(#flowGradient)" opacity="0.8" filter="url(#shadow3d2)" />
                  <rect x="230" y="15" width="100" height="50" rx="4" fill="url(#flowGradient)" opacity="0.9" filter="url(#shadow3d2)" />
                  <rect x="350" y="30" width="40" height="40" rx="4" fill="url(#flowGradient)" opacity="0.7" filter="url(#shadow3d2)" />
                  <path d="M80,40 L170,50 L280,40 L370,50" stroke="#c9a227" strokeWidth="3" fill="none" strokeDasharray="4" filter="url(#shadow3d2)" />
                </svg>
                <div className="text-3xl font-bold text-amber-400 mb-2">Instant Signal Delivery</div>
                <div className="text-sm text-zinc-400">No latency, no delays</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Real-Time Signal Alerts</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Get instant alerts on market movements and trading opportunities as they happen. Our signals are delivered in real-time with zero latency.
              </p>
              <p className="text-zinc-500">
                Never miss a trading opportunity. Our system monitors the market continuously and alerts you the moment a signal is generated.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Comprehensive Market Coverage</h3>
              <p className="text-lg text-zinc-400 mb-4">
                From major indices to individual stocks, we cover the instruments that matter. SPY, SPX, QQQ, NQ, ES, IWM, and actively traded equities with real-time bias and key levels.
              </p>
              <p className="text-zinc-500">
                Whether you're an index trader or equity focused, our signals adapt to your trading style and preferred instruments.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <svg className="w-full h-32 mb-4" viewBox="0 0 400 100">
                  <defs>
                    <filter id="shadow3d3" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <circle cx="60" cy="50" r="25" fill="none" stroke="#c9a227" strokeWidth="3" opacity="0.6" filter="url(#shadow3d3)" />
                  <circle cx="140" cy="50" r="30" fill="none" stroke="#f97316" strokeWidth="3" opacity="0.7" filter="url(#shadow3d3)" />
                  <circle cx="230" cy="50" r="35" fill="none" stroke="#c9a227" strokeWidth="3" opacity="0.8" filter="url(#shadow3d3)" />
                  <circle cx="330" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="3" opacity="0.9" filter="url(#shadow3d3)" />
                  <text x="60" y="55" textAnchor="middle" fill="#c9a227" fontSize="12" opacity="0.8" fontWeight="bold">SPY</text>
                  <text x="140" y="55" textAnchor="middle" fill="#f97316" fontSize="12" opacity="0.8" fontWeight="bold">QQQ</text>
                  <text x="230" y="55" textAnchor="middle" fill="#c9a227" fontSize="12" opacity="0.8" fontWeight="bold">SPX</text>
                  <text x="330" y="55" textAnchor="middle" fill="#f97316" fontSize="12" opacity="0.8" fontWeight="bold">NQ</text>
                </svg>
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
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">TradingView Indicator Integration</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Use our custom TradingView indicators to visualize gamma levels, key support/resistance, and signal flow directly on your charts. No need to switch between platforms.
              </p>
              <p className="text-zinc-500">
                Integrate our signals into your existing trading workflow. Our indicators work alongside your favorite tools and strategies.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Deep Knowledge & Education</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Access our comprehensive gamma levels deep knowledge base. Understand not just what the signals are, but why they work and how to interpret them in different market conditions.
              </p>
              <p className="text-zinc-500">
                From beginner concepts to advanced gamma theory, we provide the education you need to trade with confidence.
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
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Active Trader Community</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Join our Discord community of serious traders. Share insights, discuss market conditions, and learn from experienced traders who use our signals daily.
              </p>
              <p className="text-zinc-500">
                Trading doesn't have to be solitary. Connect with like-minded traders and accelerate your learning curve.
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
                Advanced predictive algorithms forecast potential price movements based on gamma exposure, market structure, and historical patterns. Get ahead of the market with data-driven projections.
              </p>
              <p className="text-zinc-500">
                Our forecasting models analyze multiple data points to provide probabilistic price targets, helping you plan entries and exits with greater confidence.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <svg className="w-full h-40 mb-4" viewBox="0 0 400 160">
                  <defs>
                    <linearGradient id="forecastGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" style={{stopColor: '#c9a227', stopOpacity: 0.3}} />
                      <stop offset="100%" style={{stopColor: '#f97316', stopOpacity: 0.6}} />
                    </linearGradient>
                    <filter id="shadow3d7" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <path d="M20,120 Q80,100 140,110 T260,80 T380,50" stroke="#c9a227" strokeWidth="4" fill="none" filter="url(#shadow3d7)" />
                  <path d="M20,120 Q80,100 140,110 T260,80 T380,50 L380,140 L20,140 Z" fill="url(#forecastGradient)" opacity="0.3" filter="url(#shadow3d7)" />
                  <path d="M260,80 Q320,60 380,50" stroke="#f97316" strokeWidth="3" fill="none" strokeDasharray="5" filter="url(#shadow3d7)" />
                  <circle cx="260" cy="80" r="8" fill="#c9a227" filter="url(#shadow3d7)" />
                  <circle cx="380" cy="50" r="8" fill="#f97316" filter="url(#shadow3d7)" />
                  <text x="260" y="65" textAnchor="middle" fill="#c9a227" fontSize="10" fontWeight="bold">Current</text>
                  <text x="380" y="35" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">Forecast</text>
                </svg>
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
                <svg className="w-full h-40 mb-4" viewBox="0 0 400 160">
                  <defs>
                    <filter id="shadow3d8" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <line x1="50" y1="80" x2="350" y2="80" stroke="#c9a227" strokeWidth="3" opacity="0.3" filter="url(#shadow3d8)" />
                  <rect x="100" y="40" width="200" height="80" rx="8" fill="none" stroke="#f97316" strokeWidth="4" opacity="0.6" filter="url(#shadow3d8)" />
                  <rect x="100" y="40" width="200" height="80" rx="8" fill="#f97316" opacity="0.15" filter="url(#shadow3d8)" />
                  <line x1="200" y1="30" x2="200" y2="130" stroke="#c9a227" strokeWidth="3" strokeDasharray="4" filter="url(#shadow3d8)" />
                  <circle cx="200" cy="80" r="10" fill="#c9a227" filter="url(#shadow3d8)" />
                  <text x="100" y="30" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">Upper</text>
                  <text x="300" y="30" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">Lower</text>
                  <text x="200" y="150" textAnchor="middle" fill="#c9a227" fontSize="10" fontWeight="bold">Expected Range</text>
                </svg>
                <div className="text-3xl font-bold text-amber-400 mb-2">Expected Range</div>
                <div className="text-sm text-zinc-400">Daily price boundaries</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Expected Range Analysis</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Know the likely daily trading range for any instrument. Our calculated expected ranges help you identify optimal entry points, stop loss levels, and profit targets.
              </p>
              <p className="text-zinc-500">
                Based on volatility, gamma levels, and market conditions, we provide realistic price boundaries for the trading session.
              </p>
            </div>
          </div>

          {/* Feature 9 - 90% Accuracy */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">90% Signal Bias Accuracy</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Our directional bias signals have demonstrated 90% accuracy in historical testing. When we say the market has a bullish or bearish bias, you can trade with confidence.
              </p>
              <p className="text-zinc-500">
                Track record verified across multiple market conditions. Our bias signals are derived from institutional-grade data and proprietary algorithms.
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
                <svg className="w-full h-40 mb-4" viewBox="0 0 400 160">
                  <defs>
                    <filter id="shadow3d10" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <path d="M20,100 L80,60 L140,110 L200,50 L260,90 L320,40 L380,80" stroke="#c9a227" strokeWidth="4" fill="none" filter="url(#shadow3d10)" />
                  <circle cx="80" cy="60" r="10" fill="#c9a227" filter="url(#shadow3d10)" />
                  <circle cx="200" cy="50" r="10" fill="#f97316" filter="url(#shadow3d10)" />
                  <circle cx="320" cy="40" r="10" fill="#c9a227" filter="url(#shadow3d10)" />
                  <text x="80" y="45" textAnchor="middle" fill="#c9a227" fontSize="10" fontWeight="bold">Low</text>
                  <text x="200" y="35" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">High</text>
                  <text x="320" y="25" textAnchor="middle" fill="#c9a227" fontSize="10" fontWeight="bold">Low</text>
                  <path d="M80,60 L80,130" stroke="#c9a227" strokeWidth="2" strokeDasharray="3" opacity="0.5" filter="url(#shadow3d10)" />
                  <path d="M200,50 L200,130" stroke="#f97316" strokeWidth="2" strokeDasharray="3" opacity="0.5" filter="url(#shadow3d10)" />
                  <path d="M320,40 L320,130" stroke="#c9a227" strokeWidth="2" strokeDasharray="3" opacity="0.5" filter="url(#shadow3d10)" />
                </svg>
                <div className="text-3xl font-bold text-amber-400 mb-2">Swings Master</div>
                <div className="text-sm text-zinc-400">Identify swing highs and lows</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Swings Master</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Automatically identify key swing highs and lows across multiple timeframes. Perfect for trend traders and those who trade market structure and price action.
              </p>
              <p className="text-zinc-500">
                Our algorithm detects significant swing points in real-time, helping you draw trend lines, identify support/resistance, and time your entries perfectly.
              </p>
            </div>
          </div>

          {/* Feature 11 - Next Day Expirations */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Next Day Expirations Master</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Track options expirations for the next trading day. Know which strikes have the most open interest and where gamma exposure will shift at the close.
              </p>
              <p className="text-zinc-500">
                Critical for understanding pin risk and potential price manipulation around expiration. Stay ahead of the gamma flip.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface)] to-[var(--surface-elevated)] p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
              <div className="relative">
                <svg className="w-full h-40 mb-4" viewBox="0 0 400 160">
                  <defs>
                    <filter id="shadow3d11" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <rect x="30" y="30" width="340" height="100" rx="8" fill="none" stroke="#c9a227" strokeWidth="3" opacity="0.4" filter="url(#shadow3d11)" />
                  <rect x="50" y="50" width="60" height="60" rx="4" fill="#c9a227" opacity="0.25" filter="url(#shadow3d11)" />
                  <rect x="120" y="50" width="60" height="60" rx="4" fill="#f97316" opacity="0.35" filter="url(#shadow3d11)" />
                  <rect x="190" y="50" width="60" height="60" rx="4" fill="#c9a227" opacity="0.3" filter="url(#shadow3d11)" />
                  <rect x="260" y="50" width="60" height="60" rx="4" fill="#f97316" opacity="0.4" filter="url(#shadow3d11)" />
                  <rect x="330" y="50" width="30" height="60" rx="4" fill="#c9a227" opacity="0.2" filter="url(#shadow3d11)" />
                  <text x="80" y="85" textAnchor="middle" fill="#c9a227" fontSize="10" fontWeight="bold">4500</text>
                  <text x="150" y="85" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">4550</text>
                  <text x="220" y="85" textAnchor="middle" fill="#c9a227" fontSize="10" fontWeight="bold">4600</text>
                  <text x="290" y="85" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold">4650</text>
                  <text x="345" y="85" textAnchor="middle" fill="#c9a227" fontSize="8" fontWeight="bold">4700</text>
                  <text x="200" y="150" textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="bold">Strike Prices</text>
                </svg>
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
                <svg className="w-full h-40 mb-4" viewBox="0 0 400 160">
                  <defs>
                    <linearGradient id="optionsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor: '#c9a227', stopOpacity: 0.4}} />
                      <stop offset="100%" style={{stopColor: '#f97316', stopOpacity: 0.7}} />
                    </linearGradient>
                    <filter id="shadow3d12" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  <polygon points="200,20 350,140 50,140" fill="url(#optionsGradient)" opacity="0.4" filter="url(#shadow3d12)" />
                  <polygon points="200,20 350,140 50,140" fill="none" stroke="#c9a227" strokeWidth="3" filter="url(#shadow3d12)" />
                  <circle cx="200" cy="60" r="18" fill="#f97316" opacity="0.7" filter="url(#shadow3d12)" />
                  <circle cx="150" cy="100" r="14" fill="#c9a227" opacity="0.6" filter="url(#shadow3d12)" />
                  <circle cx="250" cy="100" r="14" fill="#c9a227" opacity="0.6" filter="url(#shadow3d12)" />
                  <text x="200" y="65" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">PRO</text>
                  <text x="150" y="105" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">CALL</text>
                  <text x="250" y="105" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="bold">PUT</text>
                </svg>
                <div className="text-3xl font-bold text-amber-400 mb-2">Options Master Project</div>
                <div className="text-sm text-zinc-400">For profitability seekers</div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-2xl font-bold text-zinc-100 mb-4">Options Master Project</h3>
              <p className="text-lg text-zinc-400 mb-4">
                Comprehensive options analysis for traders focused on profitability. Track implied volatility, skew, and find the best options strategies for current market conditions.
              </p>
              <p className="text-zinc-500">
                From simple directional trades to complex spreads, our Options Master Project provides the data and insights you need to profit in the options market.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-100 mb-6">
            The market runs on algorithms.
          </h2>
          <p className="text-2xl md:text-3xl text-zinc-400 mb-4">
            Shouldn't you?
          </p>
          <p className="mt-6 text-lg text-zinc-500 max-w-2xl mx-auto mb-12">
            Join thousands of traders who have elevated their trading with institutional-grade market intelligence.
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
