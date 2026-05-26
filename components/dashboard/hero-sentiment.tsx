export function HeroSentiment() {
  const sentimentPct = 62;
  const label = "Cautiously risk-on";

  return (
    <section
      className="relative overflow-hidden border-b border-[var(--border)]"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-20%,rgba(201,162,39,0.18),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_60%,rgba(45,159,110,0.08),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="grid gap-14 lg:grid-cols-[1fr,430px] lg:gap-18 lg:items-center">
          <div
            className="max-w-2xl"
            style={{
              opacity: 0,
              animation: "fade-in-up 0.7s ease-out forwards",
              animationDelay: "0ms",
            }}
          >
            <p className="inline-flex rounded-full border border-[var(--accent)]/30 bg-[var(--accent-muted)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">
              Global composite briefing
            </p>
            <h1
              id="hero-heading"
              className="mt-6 text-4xl font-semibold tracking-[-0.025em] text-zinc-50 sm:text-5xl lg:text-[3.2rem] lg:leading-[1.04]"
            >
              Market sentiment stabilized after rate-path repricing
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-zinc-300/90 sm:text-lg">
              Cross-asset flows suggest selective participation in equities with
              duration hedges intact. Institutional positioning remains
              moderately long risk with elevated volatility regimes.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-md bg-[var(--accent-muted)] px-4 py-2 text-sm font-medium text-[var(--accent)] ring-1 ring-[var(--accent)]/25 transition-all hover:bg-[var(--accent)]/20"
              >
                View full dashboard
              </button>
              <button
                type="button"
                className="rounded-md border border-[var(--border)] bg-white/[0.02] px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600/80 hover:text-zinc-100"
              >
                Methodology
              </button>
            </div>
            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { k: "VIX regime", v: "Elevated complacency" },
                { k: "Credit", v: "IG tight, HY mixed" },
                { k: "FX skew", v: "USD bid on crosses" },
              ].map(({ k, v }, i) => (
                <div
                  key={`${k}-${i}`}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 px-4 py-4"
                  style={{
                    opacity: 0,
                    animation: "fade-in-up 0.55s ease-out forwards",
                    animationDelay: `${180 + i * 90}ms`,
                  }}
                >
                  <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {k}
                  </dt>
                  <dd className="mt-1.5 text-sm font-medium text-zinc-200">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div
            className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_18px_50px_-28px_rgba(0,0,0,0.9)] lg:p-8"
            style={{
              opacity: 0,
              animation: "fade-in-up 0.7s ease-out forwards",
              animationDelay: "120ms",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                  Composite sentiment index
                </p>
                <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-zinc-100">
                  {sentimentPct}
                  <span className="text-lg text-zinc-500">/100</span>
                </p>
                <p className="mt-1 text-sm text-[var(--accent)]">{label}</p>
              </div>
              <span className="rounded border border-emerald-500/20 bg-[var(--bull-muted)] px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-emerald-400/90">
                +4.2 24h
              </span>
            </div>

            <div
              className="mt-9"
              role="img"
              aria-label={`Sentiment gauge at ${sentimentPct} percent, ${label}`}
            >
              <div className="relative h-3 overflow-hidden rounded-full bg-zinc-800/80">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-800/70 via-[var(--accent)]/80 to-amber-600/70 transition-[width] duration-1000 ease-out"
                  style={{ width: `${sentimentPct}%` }}
                />
                <span
                  className="animate-shimmer pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  style={{ left: `${Math.min(sentimentPct - 18, 70)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                <span>Risk-off</span>
                <span>Neutral</span>
                <span>Risk-on</span>
              </div>
            </div>

            <div className="mt-9 grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] uppercase text-zinc-500">
                  Breadth
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  <span className="text-emerald-400/90">▲</span> Advancers
                  leading decliners — 58 / 42
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-zinc-500">
                  Flows
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  Equities +$2.1B ETF inflow (sess.)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
