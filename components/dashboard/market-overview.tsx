const indices = [
  {
    ticker: "SPX",
    name: "S&P 500",
    last: "5,821.42",
    chg: "+0.42%",
    up: true,
  },
  {
    ticker: "NDX",
    name: "Nasdaq 100",
    last: "20,894.61",
    chg: "+0.71%",
    up: true,
  },
  {
    ticker: "RUT",
    name: "Russell 2000",
    last: "2,018.17",
    chg: "−0.28%",
    up: false,
  },
  {
    ticker: "VIX",
    name: "Volatility",
    last: "14.62",
    chg: "−3.85%",
    up: false,
  },
];

const fx = [
  { pair: "DXY", px: "105.94", chg: "+0.09%", up: true },
  { pair: "EURUSD", px: "1.0832", chg: "−0.04%", up: false },
  { pair: "USDJPY", px: "149.71", chg: "+0.12%", up: true },
];

function Spark({ up }: { up: boolean }) {
  const path = up
    ? "M2 14 L7 10 L12 13 L17 7 L22 11"
    : "M2 8 L7 11 L12 7 L17 12 L22 9";
  return (
    <svg
      viewBox="0 0 24 16"
      className="h-8 w-16 shrink-0 text-zinc-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden
    >
      <path
        d={path}
        className={up ? "text-emerald-500/55" : "text-rose-500/55"}
      />
    </svg>
  );
}

export function MarketOverview() {
  return (
    <section
      id="overview"
      className="border-b border-[var(--border)] bg-[var(--surface)]/30"
      aria-labelledby="overview-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div id="markets" className="max-w-2xl scroll-mt-28">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Cross-asset snapshot
          </p>
          <h2
            id="overview-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            Market overview
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Key benchmarks and liquidity proxies. Figures are illustrative for
            layout demonstration.
          </p>
        </div>

        <div className="mt-11 grid gap-4 lg:grid-cols-4">
          {indices.map((row, i) => (
            <article
              key={`${row.ticker}-${i}`}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 transition-colors hover:border-zinc-700/70 sm:p-5"
              style={{
                opacity: 0,
                animation: "fade-in-up 0.5s ease-out forwards",
                animationDelay: `${i * 60}ms`,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-semibold text-zinc-200">
                    {row.ticker}
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">{row.name}</p>
                </div>
                <Spark up={row.up} />
              </div>
              <p className="mt-6 font-mono text-xl tabular-nums tracking-tight text-zinc-100">
                {row.last}
              </p>
              <p
                className={`mt-2 font-mono text-xs tabular-nums ${
                  row.up ? "text-emerald-400/90" : "text-rose-400/85"
                }`}
              >
                {row.chg}
              </p>
            </article>
          ))}
        </div>

        <div
          className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--background)] p-5 sm:p-6"
          style={{
            opacity: 0,
            animation: "fade-in-up 0.55s ease-out forwards",
            animationDelay: "260ms",
          }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                FX & rates snapshot
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Dollar firming into month-end rebalancing.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 sm:justify-end">
              {fx.map((f, i) => (
                <div key={`${f.pair}-${i}`} className="min-w-[100px]">
                  <p className="font-mono text-[10px] uppercase text-zinc-600">
                    {f.pair}
                  </p>
                  <p className="mt-1 font-mono text-sm tabular-nums text-zinc-200">
                    {f.px}
                  </p>
                  <p
                    className={`font-mono text-xs tabular-nums ${
                      f.up ? "text-emerald-400/90" : "text-rose-400/85"
                    }`}
                  >
                    {f.chg}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
