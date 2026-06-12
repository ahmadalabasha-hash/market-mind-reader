import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { parseCookies, SESSION_COOKIE_NAME } from "@/lib/auth-types";

const YAHOO_OPTIONS_BASE = "https://query1.finance.yahoo.com/v7/finance/options";
const YAHOO_CHART_BASE = "https://query1.finance.yahoo.com/v8/finance/chart";

const cache = new Map<string, { ts: number; payload: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type YahooOption = {
  contractSymbol: string;
  lastPrice?: number;
  change?: number;
  percentChange?: number;
  bid?: number;
  ask?: number;
  volume?: number;
  openInterest?: number;
  impliedVolatility?: number;
  inTheMoney?: boolean;
  strike?: number;
  expiration?: number;
};

interface OptionSideRow {
  contractSymbol: string;
  strike: number;
  lastPrice: number;
  change: number;
  percentChange: number;
  bid: number;
  ask: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  inTheMoney: boolean;
  expiration: string;
}

async function fetchYahooOptions(symbol: string, expiration?: string) {
  const url = `${YAHOO_OPTIONS_BASE}/${encodeURIComponent(symbol)}`;

  const fetchOnce = async () =>
    fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

  let response = await fetchOnce();
  if (response.status === 429) {
    // simple backoff then retry once
    await new Promise((res) => setTimeout(res, 1200));
    response = await fetchOnce();
  }

  if (!response.ok) {
    const hint = response.status === 429 ? " (Yahoo rate limit – wait 1-2 minutes)" : "";
    throw new Error(`Yahoo options error: ${response.status}${hint}`);
  }

  const data = await response.json();
  const result = data?.optionChain?.result?.[0];

  if (!result) {
    throw new Error("No options data available for symbol");
  }

  const expirations: number[] = result.expirationDates || [];
  const targetExpiration = expiration
    ? Math.floor(new Date(expiration).getTime() / 1000)
    : expirations[0];

  const allOptions = (result.options || []).flatMap((group: any) => {
    const calls: YahooOption[] = group.calls || [];
    const puts: YahooOption[] = group.puts || [];
    return [
      ...calls.map((o) => ({ ...o, optionType: "call" })),
      ...puts.map((o) => ({ ...o, optionType: "put" })),
    ];
  });

  const filtered = allOptions.filter((opt: YahooOption & { optionType?: string }) => {
    if (!targetExpiration) return true;
    return opt.expiration === targetExpiration;
  });

  const mapRow = (opt: YahooOption & { optionType?: string }): OptionSideRow | null => {
    if (!opt.contractSymbol || !opt.strike) return null;
    const expirationDate = new Date((opt.expiration || targetExpiration || 0) * 1000)
      .toISOString()
      .split("T")[0];

    return {
      contractSymbol: opt.contractSymbol,
      strike: opt.strike,
      lastPrice: opt.lastPrice ?? 0,
      change: opt.change ?? 0,
      percentChange: opt.percentChange ?? 0,
      bid: opt.bid ?? 0,
      ask: opt.ask ?? 0,
      volume: opt.volume ?? 0,
      openInterest: opt.openInterest ?? 0,
      impliedVolatility: (opt.impliedVolatility ?? 0) * 100,
      inTheMoney: Boolean(opt.inTheMoney),
      expiration: expirationDate,
    };
  };

  const calls = filtered
    .filter((o: YahooOption & { optionType?: string }) => o.optionType === "call")
    .map((o: YahooOption & { optionType?: string }) => mapRow(o))
    .filter((o: OptionSideRow | null): o is OptionSideRow => Boolean(o));

  const puts = filtered
    .filter((o: YahooOption & { optionType?: string }) => o.optionType === "put")
    .map((o: YahooOption & { optionType?: string }) => mapRow(o))
    .filter((o: OptionSideRow | null): o is OptionSideRow => Boolean(o));

  return {
    expirations: expirations.map((ts) => new Date(ts * 1000).toISOString().split("T")[0]),
    calls,
    puts,
    underlyingPrice: result?.quote?.regularMarketPrice ?? null,
  };
}

async function fetchUnderlyingHistory(symbol: string) {
  const url = `${YAHOO_CHART_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=1y&includePrePost=false`;

  const fetchOnce = async () =>
    fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

  let response = await fetchOnce();
  if (response.status === 429) {
    await new Promise((res) => setTimeout(res, 1200));
    response = await fetchOnce();
  }

  if (!response.ok) {
    const hint = response.status === 429 ? " (Yahoo rate limit – wait 1-2 minutes)" : "";
    throw new Error(`Yahoo chart error: ${response.status}${hint}`);
  }

  const data = await response.json();
  const chart = data?.chart?.result?.[0];

  if (!chart || !Array.isArray(chart.timestamp) || !chart.indicators?.quote?.[0]?.close) {
    throw new Error("Invalid chart data");
  }

  const timestamps: number[] = chart.timestamp;
  const closes: Array<number | null> = chart.indicators.quote[0].close;

  const series = timestamps
    .map((ts, idx) => {
      const close = closes[idx];
      if (close == null) return null;
      return {
        time: ts * 1000,
        close,
      };
    })
    .filter((row): row is { time: number; close: number } => Boolean(row));

  return series;
}

export async function GET(req: Request) {
  try {
    const cookies = parseCookies(req.headers.get("cookie"));
    const token = cookies[SESSION_COOKIE_NAME];
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get("symbol")?.trim();
    const expiration = searchParams.get("expiration")?.trim() || undefined;

    if (!rawSymbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    const symbol = rawSymbol.toUpperCase();
    const cacheKey = `${symbol}::${expiration || "auto"}`;

    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({ ...cached.payload, stale: false, cached: true });
    }

    const [options, history] = await Promise.all([
      fetchYahooOptions(symbol, expiration),
      fetchUnderlyingHistory(symbol),
    ]);

    const payload = {
      symbol,
      expirations: options.expirations,
      calls: options.calls,
      puts: options.puts,
      underlyingPrice: options.underlyingPrice,
      history,
      stale: false,
      cached: false,
    };

    cache.set(cacheKey, { ts: Date.now(), payload });

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch options history";

    // Fallback to cached data if available when hitting rate limits
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get("symbol")?.trim();
    const expiration = searchParams.get("expiration")?.trim() || undefined;
    const symbol = rawSymbol?.toUpperCase();
    const cacheKey = symbol ? `${symbol}::${expiration || "auto"}` : undefined;

    if (cacheKey && message.includes("429") && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)!;
      return NextResponse.json({ ...cached.payload, stale: true, cached: true, error: message }, { status: 200 });
    }

    console.error("options-history error", error);
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
