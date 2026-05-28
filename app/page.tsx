import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-orange-500/10"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-8 shadow-2xl shadow-amber-500/30">
              <svg className="w-10 h-10 text-zinc-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-100 sm:text-6xl lg:text-7xl">
              Market Signals
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-zinc-400">
              Institutional-grade market intelligence and trading signals for serious traders
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth?tier=trial"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 text-base font-semibold text-zinc-950 transition-all hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
              >
                Start Free Trial
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800/50 px-8 py-4 text-base font-semibold text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Why Choose Market Signals?
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Professional-grade tools for professional traders
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Real-Time Signals</h3>
            <p className="text-zinc-400">Get instant alerts on market movements and trading opportunities as they happen.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Market Indices</h3>
            <p className="text-zinc-400">Comprehensive coverage of SPY, SPX, NQ, ES, QQQ and major market indices.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Stock Signals</h3>
            <p className="text-zinc-400">Individual stock alerts and recommendations for the most traded stocks.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Gamma Levels</h3>
            <p className="text-zinc-400">Advanced gamma exposure analysis and options flow insights.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Custom Integration</h3>
            <p className="text-zinc-400">TradingView indicator integration for your custom trading setup.</p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Discord Community</h3>
            <p className="text-zinc-400">Join our community of traders and share insights in real-time.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Ready to Elevate Your Trading?
          </h2>
          <p className="mt-4 text-lg text-zinc-400">
            Start your free trial today and experience professional-grade market intelligence
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth?tier=trial"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 text-base font-semibold text-zinc-950 transition-all hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-800/50 px-8 py-4 text-base font-semibold text-zinc-200 transition-all hover:bg-zinc-700 hover:text-white"
            >
              Compare Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
