"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { useRouter } from "next/navigation";

type OptionRow = {
  ticker: string;
  strike_price: number;
  contract_type: "call" | "put";
  expiration_date: string;
};

type HistoryPoint = { time: number; close: number };

type ChainResponse = {
  expirations: string[];
  calls: OptionRow[];
  puts: OptionRow[];
  stale?: boolean;
  cached?: boolean;
  error?: string;
};

type HistoryResponse = {
  history: HistoryPoint[];
  ticker?: string;
  stale?: boolean;
  cached?: boolean;
  error?: string;
};

export default function PolygonBacktestPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [expiration, setExpiration] = useState<string | undefined>(undefined);
  const [expirations, setExpirations] = useState<string[]>([]);
  const [calls, setCalls] = useState<OptionRow[]>([]);
  const [puts, setPuts] = useState<OptionRow[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchChain = async (sym: string, exp?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ symbol: sym });
      if (exp) params.set("expiration", exp);
      const res = await fetch(`/api/polygon-options?${params.toString()}`);
      const data: ChainResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch options data");
      }
      setExpirations(data.expirations || []);
      setCalls(data.calls || []);
      setPuts(data.puts || []);
      if (!exp && data.expirations?.[0]) {
        setExpiration(data.expirations[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (ticker: string, exp?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ symbol, ticker, timespan: "minute" });
      if (exp) params.set("expiration", exp);
      const res = await fetch(`/api/polygon-options?${params.toString()}`);
      const data: HistoryResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch history");
      }
      setHistory(data.history || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChain(symbol, expiration);
  }, []);

  useEffect(() => {
    fetchChain(symbol, expiration);
  }, [symbol, expiration]);

  useEffect(() => {
    if (selectedTicker) {
      fetchHistory(selectedTicker, expiration);
    } else {
      setHistory([]);
    }
  }, [selectedTicker, expiration]);

  const sparklinePath = useMemo(() => {
    if (history.length < 2) return "";
    const values = history.slice(-180); // roughly last ~3 months of minutes
    const min = Math.min(...values.map((p) => p.close));
    const max = Math.max(...values.map((p) => p.close));
    const range = Math.max(max - min, 1e-6);
    const width = 300;
    const height = 80;
    return values
      .map((p, idx) => {
        const x = (idx / Math.max(values.length - 1, 1)) * width;
        const y = height - ((p.close - min) / range) * height;
        return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [history]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] text-[var(--foreground)]">
      <DashboardHeader />
      <main className="min-h-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Options Master</p>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-100 sm:text-4xl">Polygon Backtest</h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                Historical options (expired included) via Polygon. Select symbol & expiration, then click a contract to see its price history (minute).
              </p>
            </div>
            <button
              onClick={() => router.push("/options-master")}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
            >
              Back to Options Master
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/50 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="text-xs text-zinc-500">Symbol</label>
                  <input
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none"
                    placeholder="SPY"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="text-xs text-zinc-500">Expiration</label>
                  <select
                    value={expiration || ""}
                    onChange={(e) => setExpiration(e.target.value || undefined)}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="">Newest</option>
                    {expirations.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-1 flex items-end gap-2">
                  <button
                    onClick={() => fetchChain(symbol, expiration)}
                    className="w-full rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-2 text-sm font-semibold text-zinc-950 hover:from-amber-500 hover:to-orange-600"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={() => { setSelectedTicker(null); setHistory([]); }}
                    className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <div className="text-xs text-zinc-500">Expirations: {expirations.length || "--"}</div>
                {selectedTicker && (
                  <div className="text-xs text-amber-300">Selected: {selectedTicker}</div>
                )}
                {loading && <div className="text-xs text-blue-400">Loading…</div>}
                {error && <div className="text-xs text-rose-400">{error}</div>}
              </div>

              <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Contract History</p>
                    <h3 className="text-lg font-semibold text-zinc-100">Last ~3 months (minute)</h3>
                  </div>
                  <div className="text-xs text-zinc-500">{history.length} points</div>
                </div>
                <div className="mt-3 h-24 w-full overflow-hidden">
                  {sparklinePath ? (
                    <svg viewBox="0 0 300 80" className="w-full h-full">
                      <path d={sparklinePath} fill="none" stroke="#f59e0b" strokeWidth="2" />
                    </svg>
                  ) : (
                    <div className="text-xs text-zinc-500">Select a contract to load history</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-4">
              <h3 className="text-lg font-semibold text-purple-100">What this page does</h3>
              <ul className="mt-3 space-y-2 text-sm text-purple-100/80">
                <li>• Pulls expired & active chains from Polygon (last ~2 years)</li>
                <li>• Lets you pick past expirations to backtest</li>
                <li>• Click a contract to view minute-level history (~90 days)</li>
                <li>• Respects 5 req/min with caching</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <OptionTable title="Calls" rows={calls} onSelect={setSelectedTicker} selected={selectedTicker} />
            <OptionTable title="Puts" rows={puts} onSelect={setSelectedTicker} selected={selectedTicker} />
          </div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}

function OptionTable({ title, rows, onSelect, selected }: { title: string; rows: OptionRow[]; onSelect: (t: string) => void; selected: string | null }) {
  return (
    <div className="rounded-2xl border border-zinc-700/60 bg-zinc-900/50">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        <p className="text-xs text-zinc-500">Top {rows.length} contracts</p>
      </div>
      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-zinc-950/50 text-zinc-400">
            <tr>
              <th className="px-3 py-2 text-left">Strike</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Expiration</th>
              <th className="px-3 py-2 text-left">Ticker</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-center text-xs text-zinc-500" colSpan={4}>
                  No data
                </td>
              </tr>
            ) : (
              rows.slice(0, 50).map((row) => (
                <tr
                  key={row.ticker}
                  className={`border-t border-zinc-800/60 hover:bg-zinc-800/40 cursor-pointer ${selected === row.ticker ? "bg-zinc-800/60" : ""}`}
                  onClick={() => onSelect(row.ticker)}
                >
                  <td className="px-3 py-2 text-zinc-100 font-semibold">{row.strike_price.toFixed(2)}</td>
                  <td className="px-3 py-2 text-zinc-200 capitalize">{row.contract_type}</td>
                  <td className="px-3 py-2 text-zinc-200">{row.expiration_date}</td>
                  <td className="px-3 py-2 text-zinc-200 font-mono text-xs">{row.ticker}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
