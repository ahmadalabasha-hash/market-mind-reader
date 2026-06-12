"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardFooter } from "@/components/dashboard/dashboard-footer";
import { useRouter } from "next/navigation";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

type OptionRow = {
  ticker: string;
  strike_price: number;
  contract_type: "call" | "put";
  expiration_date: string;
};

type HistoryPoint = { time: number; open: number; high: number; low: number; close: number };

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

export default function SSLacalPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [expiration, setExpiration] = useState<string | undefined>(undefined);
  const [expirations, setExpirations] = useState<string[]>([]);
  const [calls, setCalls] = useState<OptionRow[]>([]);
  const [puts, setPuts] = useState<OptionRow[]>([]);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timespan, setTimespan] = useState<"minute" | "day">("minute");
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
      const params = new URLSearchParams({ symbol, ticker, timespan });
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
  }, [selectedTicker, expiration, timespan]);

  const chartData = useMemo(() => {
    return history.map((p) => ({
      date: new Date(p.time).toLocaleDateString(),
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    }));
  }, [history]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--background)] text-[var(--foreground)]">
      <DashboardHeader />
      <main className="min-h-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">Options Master</p>
              <h1 className="mt-2 text-3xl font-semibold text-zinc-100 sm:text-4xl">SS Local (Polygon)</h1>
              <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                Historical options (including expired) via Polygon. Select symbol & expiration, then click a contract to see minute-level history.
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
              <div className="grid gap-3 sm:grid-cols-4">
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
                <div className="sm:col-span-1">
                  <label className="text-xs text-zinc-500">Timespan</label>
                  <select
                    value={timespan}
                    onChange={(e) => setTimespan(e.target.value as "minute" | "day")}
                    className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-400 focus:outline-none"
                  >
                    <option value="minute">1 Minute</option>
                    <option value="day">1 Day</option>
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
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Contract History</p>
                    <h3 className="text-lg font-semibold text-zinc-100">
                      {timespan === "minute" ? "Last 7 days (1m)" : "Last 2 years (1d)"}
                    </h3>
                  </div>
                  <div className="text-xs text-zinc-500">{history.length} points</div>
                </div>
                <div className="mt-3 h-[400px] w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#71717a"
                          fontSize={12}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                          }}
                        />
                        <YAxis 
                          stroke="#71717a"
                          fontSize={12}
                          domain={['auto', 'auto']}
                          tickFormatter={(value) => `$${value.toFixed(2)}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#18181b', 
                            border: '1px solid #27272a',
                            borderRadius: '8px'
                          }}
                          itemStyle={{ color: '#a1a1aa' }}
                          labelStyle={{ color: '#a1a1aa' }}
                          formatter={(value: any) => `$${Number(value).toFixed(2)}`}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="close" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-xs text-zinc-500">Select a contract to load history</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 p-4">
              <h3 className="text-lg font-semibold text-purple-100">What this page does</h3>
              <ul className="mt-3 space-y-2 text-sm text-purple-100/80">
                <li>• Pulls expired & active chains from Polygon (last ~2 years)</li>
                <li>• Lets you pick past expirations to backtest</li>
                <li>• Click a contract to view options price history (1m or 1d)</li>
                <li>• Shows options contract prices, not underlying stock price</li>
                <li>• 1m shows last 7 days, 1d shows last 2 years</li>
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
