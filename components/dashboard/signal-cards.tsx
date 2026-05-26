const bullish = [
  {
    symbol: "XLK US",
    name: "Technology",
    signal: "Relative strength breakout",
    conf: "High",
    time: "14:02 UTC",
  },
  {
    symbol: "AAPL US",
    name: "Apple Inc.",
    signal: "Volatility compression · call skew",
    conf: "Med",
    time: "13:41 UTC",
  },
  {
    symbol: "XLE US",
    name: "Energy",
    signal: "Crude linkage · momentum reclaim",
    conf: "Med",
    time: "12:58 UTC",
  },
];

const bearish = [
  {
    symbol: "KWEB US",
    name: "China Internet",
    signal: "FX headwind · ADR dispersion",
    conf: "High",
    time: "14:06 UTC",
  },
  {
    symbol: "IWM US",
    name: "Russell 2000",
    signal: "Credit beta · small-cap underperf.",
    conf: "Med",
    time: "13:22 UTC",
  },
  {
    symbol: "ARKK US",
    name: "Innovation baskets",
    signal: "Crowding unwind · gamma reset",
    conf: "Med",
    time: "11:15 UTC",
  },
];

function SignalColumn({
  title,
  accent,
  accentBg,
  lineClass,
  items,
}: {
  title: string;
  accent: string;
  accentBg: string;
  lineClass: string;
  items: typeof bullish;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className={`h-px flex-1 ${lineClass}`} aria-hidden />
        <h3
          className={`font-mono text-[11px] uppercase tracking-[0.22em] ${accent}`}
        >
          {title}
        </h3>
        <span className={`h-px flex-1 ${lineClass}`} aria-hidden />
      </div>
      <ul className="flex flex-col gap-3">
        {items.map((item, i) => (
          <li
            key={`${item.symbol}-${item.time}-${i}`}
            className={`group rounded-lg border border-[var(--border)] ${accentBg} p-4 transition-all duration-300 hover:border-zinc-600/50`}
            style={{
              opacity: 0,
              animation: "fade-in-up 0.5s ease-out forwards",
              animationDelay: `${i * 70}ms`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-zinc-100">
                  {item.symbol}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">{item.name}</p>
              </div>
              <span className="shrink-0 rounded border border-zinc-700/60 bg-black/20 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                {item.conf}
              </span>
            </div>
            <p className="mt-3 text-sm leading-snug text-zinc-300">
              {item.signal}
            </p>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              {item.time}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SignalCards() {
  return (
    <section
      id="signals"
      className="border-b border-[var(--border)]"
      aria-labelledby="signals-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Positioning monitor
          </p>
          <h2
            id="signals-heading"
            className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
          >
            Signal flow
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Model-derived highlights across factors, options positioning, and
            cross-asset stress. Illustrative only — not investment advice.
          </p>
        </div>

        <div className="mt-11 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <SignalColumn
            title="Bullish"
            accent="text-emerald-400/90"
            accentBg="bg-[var(--bull-muted)]"
            lineClass="bg-emerald-500/25"
            items={bullish}
          />
          <SignalColumn
            title="Bearish"
            accent="text-rose-400/85"
            accentBg="bg-[var(--bear-muted)]"
            lineClass="bg-rose-500/25"
            items={bearish}
          />
        </div>
      </div>
    </section>
  );
}
