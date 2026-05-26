"use client";

import { useCallback, useEffect, useState } from "react";
import type { OptionsContract } from "@/lib/mock-options";

type SortField = "ivRank1y" | "impliedVolatility" | "volume" | "openInterest";

export default function OptionsClientPage() {
  const [data, setData] = useState<OptionsContract[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("ivRank1y");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        sortBy,
        sortDir,
      });

      const response = await fetch(`/api/options?${params}`);
      const result = await response.json();

      setData(result.data);
      setTotal(result.pagination.total);
      setPages(result.pagination.pages);
    } catch (err) {
      console.error("Failed to fetch options data:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, sortBy, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, sortDir, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const getIVColor = (ivRank: number) => {
    if (ivRank >= 80) return "text-rose-400";
    if (ivRank >= 60) return "text-amber-400";
    if (ivRank >= 40) return "text-emerald-400";
    return "text-zinc-400";
  };

  const getIVBg = (ivRank: number) => {
    if (ivRank >= 80) return "bg-rose-500/10";
    if (ivRank >= 60) return "bg-amber-500/10";
    if (ivRank >= 40) return "bg-emerald-500/10";
    return "bg-zinc-900/20";
  };

  return (
    <div className="min-h-full bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Market data
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Implied Volatility Ranking
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-zinc-400">
            Options contracts ranked by 1-year implied volatility. Higher IV rank indicates elevated option premiums relative to recent history.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/30 p-6 mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <label htmlFor="search" className="block text-xs text-zinc-500 mb-2">
                Search symbol or name
              </label>
              <input
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SPY, AAPL, etc..."
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label htmlFor="limit" className="block text-xs text-zinc-500 mb-2">
                Per page
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]/20">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)]/40">
                <th className="px-6 py-4 text-left font-semibold text-zinc-300">Symbol</th>
                <th className="px-6 py-4 text-left font-semibold text-zinc-300">Name</th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("ivRank1y")}
                    className="w-full px-6 py-4 text-left font-semibold text-zinc-300 hover:text-zinc-100 transition"
                  >
                    IV Rank (1Y) {sortBy === "ivRank1y" && (sortDir === "asc" ? "↑" : "↓")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("impliedVolatility")}
                    className="w-full px-6 py-4 text-left font-semibold text-zinc-300 hover:text-zinc-100 transition"
                  >
                    IV {sortBy === "impliedVolatility" && (sortDir === "asc" ? "↑" : "↓")}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-zinc-300">Type</th>
                <th className="px-6 py-4 text-left font-semibold text-zinc-300">Strike</th>
                <th className="px-6 py-4 text-left font-semibold text-zinc-300">Expires</th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("volume")}
                    className="w-full px-6 py-4 text-left font-semibold text-zinc-300 hover:text-zinc-100 transition"
                  >
                    Volume {sortBy === "volume" && (sortDir === "asc" ? "↑" : "↓")}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    onClick={() => handleSort("openInterest")}
                    className="w-full px-6 py-4 text-left font-semibold text-zinc-300 hover:text-zinc-100 transition"
                  >
                    OI {sortBy === "openInterest" && (sortDir === "asc" ? "↑" : "↓")}
                  </button>
                </th>
                <th className="px-6 py-4 text-left font-semibold text-zinc-300">Bid-Ask</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-zinc-500">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-zinc-500">
                    No contracts found
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={`${row.symbol}-${row.strikePrice}-${row.optionType}-${idx}`}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface)]/20 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-zinc-100">{row.symbol}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400">{row.name}</td>
                    <td className={`px-6 py-4 font-semibold ${getIVColor(row.ivRank1y)}`}>
                      <span className={`px-2 py-1 rounded ${getIVBg(row.ivRank1y)}`}>
                        {row.ivRank1y}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">{(row.impliedVolatility * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          row.optionType === "call"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {row.optionType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-300">${row.strikePrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{row.expirationDate}</td>
                    <td className="px-6 py-4 text-zinc-300">{row.volume.toLocaleString()}</td>
                    <td className="px-6 py-4 text-zinc-300">{row.openInterest.toLocaleString()}</td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      {row.bid.toFixed(2)} / {row.ask.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Showing {data.length > 0 ? (page - 1) * limit + 1 : 0} to {data.length > 0 ? (page - 1) * limit + data.length : 0} of {total} contracts
          </p>
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= pages}
              onClick={() => setPage((current) => Math.min(pages, current + 1))}
              className="rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
