"use client";

import { useMemo, useState } from "react";
import type { SignalRow } from "@/lib/signals";

function statusFromSignal(row: SignalRow): string {
  if (row.currentPrice === undefined) {
    return row.notes || "Testing level";
  }

  const deltaPct = ((row.currentPrice - row.keyLevel) / row.keyLevel) * 100;
  const isNear = Math.abs(deltaPct) < 0.2;
  const above = row.currentPrice > row.keyLevel;

  if (isNear) return "Breakout in progress";
  if (above && row.bias === "bullish") return "Bullish shift confirmed";
  if (!above && row.bias === "bearish") return "Bearish shift confirmed";
  return above ? "Above key level" : "Below key level";
}

function formatDate(value?: string) {
  if (!value) return "N/A";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  return new Date(parsed).toLocaleString();
}

export function SignalsTerminal({
  signals,
  initialQuery,
}: {
  signals: SignalRow[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState((initialQuery || "").toUpperCase());
  const normalizedQuery = query.trim().toUpperCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) return signals;
    return signals.filter((row) => {
      const symbolMatch = row.symbol.includes(normalizedQuery);
      const biasMatch = row.bias.toUpperCase().includes(normalizedQuery);
      const keyLevelMatch = String(row.keyLevel).includes(normalizedQuery);
      const notesMatch = row.notes?.toUpperCase().includes(normalizedQuery);
      const dateMatch = row.date?.toUpperCase().includes(normalizedQuery);
      return symbolMatch || biasMatch || keyLevelMatch || notesMatch || dateMatch;
    });
  }, [normalizedQuery, signals]);

  const primary = filtered[0];
  const showNoResults = normalizedQuery && filtered.length === 0;
  const latestSignals = !normalizedQuery ? signals.slice(0, 6) : [];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 p-4 sm:p-6">
        <label
          htmlFor="symbol"
          className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500"
        >
          Enter symbol
        </label>
        <input
          id="symbol"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder="Enter symbol..."
          className="mt-3 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-base text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-zinc-500"
        />
        {signals.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            No sheet data loaded yet. Set `SIGNALS_SHEET_CSV_URL` to your
            published Google Sheet CSV URL.
          </p>
        ) : (
          <p className="mt-3 text-sm text-zinc-400">
            Search by symbol, bias, key level, or date. Leave blank to browse
            the latest signals.
          </p>
        )}
      </div>

      {showNoResults ? (
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/30 p-6 text-zinc-400">
          No signal found for this symbol
        </div>
      ) : null}

      {latestSignals.length > 0 ? (
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/30 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">
                Latest signals
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Showing the most recent entries from your signal sheet.
              </p>
            </div>
            <span className="rounded-full bg-[var(--background)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
              Latest
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestSignals.map((signal, index) => (
              <div
                key={`${signal.symbol}-${signal.keyLevel}-${signal.date || index}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <p className="text-xs text-zinc-500">{signal.symbol}</p>
                <p className="mt-2 text-xl font-semibold text-zinc-100">
                  {signal.bias}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  Key level {signal.keyLevel}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatDate(signal.date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {primary ? (
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]/30 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h2 className="text-4xl font-semibold tracking-tight text-zinc-100">
              {primary.symbol}
            </h2>
            <span
              className={`rounded px-3 py-1 text-sm font-medium ${
                primary.bias === "bullish"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              {primary.bias}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs text-zinc-500">Key level</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-100">
                {primary.keyLevel}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs text-zinc-500">Status</p>
              <p className="mt-2 text-sm font-medium text-zinc-200">
                {statusFromSignal(primary)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs text-zinc-500">Price relation</p>
              <p className="mt-2 text-sm font-medium text-zinc-200">
                {primary.currentPrice !== undefined
                  ? primary.currentPrice >= primary.keyLevel
                    ? "Above key level"
                    : "Below key level"
                  : "N/A"}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs text-zinc-500">Last updated</p>
              <p className="mt-2 text-sm font-medium text-zinc-200">
                {formatDate(primary.date)}
              </p>
            </div>
          </div>

          {filtered.length > 1 ? (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-zinc-300">History</h3>
              <ul className="mt-3 space-y-2">
                {filtered.slice(1).map((row, index) => (
                  <li
                    key={`${row.symbol}-${row.keyLevel}-${row.date || "nd"}-${index}`}
                    className="rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-zinc-300"
                  >
                    {formatDate(row.date)} - {row.bias} - key level {row.keyLevel}
                    {row.notes ? ` - ${row.notes}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
