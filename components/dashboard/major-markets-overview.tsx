import { fetchMarketQuotes, type MarketQuote } from "@/lib/market-data";

function ChangeBadge({ value, up }: { value: string; up: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
        up ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
      }`}
    >
      {value}
    </span>
  );
}

export async function MajorMarketsOverview() {
  const marketQuotes: MarketQuote[] = await fetchMarketQuotes();

  return (
    <section
      id="major-markets"
      className="border-b border-[var(--border)] bg-[var(--surface)]/30"
      aria-labelledby="major-markets-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Major markets overview
            </p>
            <h2
              id="major-markets-heading"
              className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl"
            >
              Live contract snapshot
            </h2>
          </div>
          <p className="text-sm text-zinc-400">
            Key market contracts updated in real time for quick reference.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-[var(--border)] bg-[var(--background)]/80">
          <table className="min-w-full table-auto text-left text-sm">
            <thead className="bg-[var(--surface)]/80 text-zinc-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Contract Name</th>
                <th className="px-5 py-4 font-semibold">Latest</th>
                <th className="px-5 py-4 font-semibold">Change</th>
                <th className="px-5 py-4 font-semibold">High</th>
                <th className="px-5 py-4 font-semibold">Low</th>
                <th className="px-5 py-4 font-semibold">Volume</th>
                <th className="px-5 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {marketQuotes.map((row, index) => (
                <tr
                  key={row.symbol}
                  className={`border-t border-[var(--border)] ${
                    index % 2 === 0 ? "bg-[rgba(255,255,255,0.02)]" : ""
                  }`}
                >
                  <td className="px-5 py-4 font-semibold text-zinc-100">{row.contract}</td>
                  <td className="px-5 py-4 text-zinc-200">{row.latest}</td>
                  <td className="px-5 py-4">
                    <ChangeBadge value={row.change} up={row.up} />
                  </td>
                  <td className="px-5 py-4 text-zinc-200">{row.high}</td>
                  <td className="px-5 py-4 text-zinc-200">{row.low}</td>
                  <td className="px-5 py-4 text-zinc-200">{row.volume}</td>
                  <td className="px-5 py-4 text-zinc-200">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
