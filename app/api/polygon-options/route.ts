import { NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";
import { parseCookies, SESSION_COOKIE_NAME } from "@/lib/auth-types";

const cache = new Map<string, { ts: number; payload: any }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes to stay within 5 req/min

const POLYGON_BASE = "https://api.polygon.io";

interface PolygonOptionContract {
  ticker: string; // e.g., O:SPY240621C00550000
  underlying_ticker: string;
  expiration_date: string; // YYYY-MM-DD
  strike_price: number;
  contract_type: "call" | "put";
  exercise_style?: string;
  shares_per_contract?: number;
  primary_exchange?: string;
  description?: string;
}

interface ChainResponse {
  expirations: string[];
  calls: PolygonOptionContract[];
  puts: PolygonOptionContract[];
  stale?: boolean;
  cached?: boolean;
}

interface HistoryPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface HistoryResponse {
  ticker: string;
  history: HistoryPoint[];
  stale?: boolean;
  cached?: boolean;
}

const requireApiKey = () => {
  const key = process.env.POLYGON_API_KEY;
  if (!key) {
    throw new Error("POLYGON_API_KEY not set. Add it to .env.local");
  }
  return key;
};

async function fetchJson(url: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "market-signals-platform/1.0",
    },
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) {
      throw new Error("Polygon rate limit exceeded (5 req/min on free tier). Wait 1 minute and try again.");
    }
    throw new Error(`Polygon error ${res.status}: ${text}`);
  }
  return res.json();
}

async function getExpirations(symbol: string, apiKey: string) {
  const cacheKey = `expirations::${symbol}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    console.log(`[Polygon] Using cached expirations for ${symbol}`);
    return { expirations: cached.payload as string[], stale: false, cached: true };
  }

  const url = `${POLYGON_BASE}/v3/reference/options/contracts?underlying_ticker=${encodeURIComponent(
    symbol,
  )}&expired=true&limit=1000&sort=expiration_date&order=desc&apiKey=${apiKey}`;

  const data = await fetchJson(url);
  console.log(`[Polygon] Expirations for ${symbol}:`, data.results?.length || 0, "results");
  const expirationList: string[] = Array.from(
    new Set(
      (data.results || [])
        .map((r: { expiration_date?: unknown }) => (typeof r.expiration_date === "string" ? r.expiration_date : undefined))
        .filter((d: string | undefined): d is string => typeof d === "string"),
    ),
  );
  console.log(`[Polygon] Unique expirations:`, expirationList.length);

  const expirations = expirationList.sort((a: string, b: string) => (a > b ? -1 : 1));

  cache.set(cacheKey, { ts: Date.now(), payload: expirations });
  return { expirations, stale: false, cached: false };
}

async function getChain(symbol: string, expiration: string, apiKey: string): Promise<ChainResponse> {
  const cacheKey = `chain::${symbol}::${expiration}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { ...cached.payload, stale: false, cached: true } as ChainResponse;
  }

  const url = `${POLYGON_BASE}/v3/reference/options/contracts?underlying_ticker=${encodeURIComponent(
    symbol,
  )}&expiration_date=${encodeURIComponent(expiration)}&expired=true&limit=1000&apiKey=${apiKey}`;

  const data = await fetchJson(url);
  console.log(`[Polygon] Chain for ${symbol} ${expiration}:`, data.results?.length || 0, "contracts");
  const contracts: PolygonOptionContract[] = (data.results || []).map((r: any) => ({
    ticker: r.ticker,
    underlying_ticker: r.underlying_ticker,
    expiration_date: r.expiration_date,
    strike_price: r.strike_price,
    contract_type: r.contract_type,
    exercise_style: r.exercise_style,
    shares_per_contract: r.shares_per_contract,
    primary_exchange: r.primary_exchange,
    description: r.description,
  }));
  console.log(`[Polygon] Calls:`, contracts.filter((c) => c.contract_type === "call").length, "Puts:", contracts.filter((c) => c.contract_type === "put").length);

  const calls = contracts.filter((c) => c.contract_type === "call");
  const puts = contracts.filter((c) => c.contract_type === "put");

  const payload: ChainResponse = {
    expirations: [], // filled by caller
    calls,
    puts,
    stale: false,
    cached: false,
  };

  cache.set(cacheKey, { ts: Date.now(), payload });
  return payload;
}

async function getHistory(
  ticker: string,
  fromDate: string,
  toDate: string,
  timespan: "minute" | "day" = "day",
  apiKey: string,
): Promise<HistoryResponse> {
  const cacheKey = `hist::${ticker}::${fromDate}::${toDate}::${timespan}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return { ...cached.payload, stale: false, cached: true } as HistoryResponse;
  }

  const url = `${POLYGON_BASE}/v2/aggs/ticker/${encodeURIComponent(
    ticker,
  )}/range/1/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;

  const data = await fetchJson(url);
  console.log(`[Polygon] History for ${ticker} (${fromDate} to ${toDate}, ${timespan}):`, data.results?.length || 0, "points");
  const results = data.results || [];

  // Log sample data for debugging
  if (results.length > 0) {
    console.log(`[Polygon] Sample data:`, JSON.stringify(results.slice(0, 3), null, 2));
  }

  const history: HistoryPoint[] = results
    .map((r: any) => ({
      time: typeof r.t === "number" ? r.t : Date.parse(r.t),
      open: typeof r.o === "number" ? r.o : null,
      high: typeof r.h === "number" ? r.h : null,
      low: typeof r.l === "number" ? r.l : null,
      close: typeof r.c === "number" ? r.c : null,
    }))
    .filter((p: { time: number; open: number | null; high: number | null; low: number | null; close: number | null }): p is HistoryPoint => p.close !== null && p.open !== null && p.high !== null && p.low !== null);

  const payload: HistoryResponse = { ticker, history, stale: false, cached: false };
  cache.set(cacheKey, { ts: Date.now(), payload });
  return payload;
}

function computeRange(expiration?: string, timespan: "minute" | "day" = "day") {
  const today = new Date();
  const end = expiration ? new Date(expiration) : today;
  const endDate = end > today ? today : end;
  // For minute data, limit to 7 days to avoid excessive data points
  // For daily data, use 2 years
  const daysBack = timespan === "minute" ? 7 : 730;
  const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const to = endDate.toISOString().split("T")[0];
  const from = startDate.toISOString().split("T")[0];
  return { from, to };
}

export async function GET(req: Request) {
  try {
    const cookies = parseCookies(req.headers.get("cookie"));
    const token = cookies[SESSION_COOKIE_NAME];
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = requireApiKey();
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol")?.trim()?.toUpperCase();
    const expiration = searchParams.get("expiration")?.trim();
    const ticker = searchParams.get("ticker")?.trim();
    const timespan = (searchParams.get("timespan") || "day") as "minute" | "day";
    const rangeFrom = searchParams.get("from")?.trim();
    const rangeTo = searchParams.get("to")?.trim();

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol" }, { status: 400 });
    }

    const expData = await getExpirations(symbol, apiKey);
    const expirations = expData.expirations;

    let chain: ChainResponse | null = null;
    if (expiration || expirations[0]) {
      const targetExp = expiration || expirations[0];
      chain = await getChain(symbol, targetExp, apiKey);
      chain.expirations = expirations;
    }

    let history: HistoryResponse | null = null;
    if (ticker) {
      const { from, to } = rangeFrom && rangeTo ? { from: rangeFrom, to: rangeTo } : computeRange(expiration || undefined, timespan);
      history = await getHistory(ticker, from, to, timespan, apiKey);
    }

    return NextResponse.json({
      symbol,
      expirations,
      calls: chain?.calls || [],
      puts: chain?.puts || [],
      underlyingPrice: null, // not fetched to avoid extra calls
      history: history?.history || [],
      historyTicker: history?.ticker,
      stale: expData.stale || chain?.stale || history?.stale || false,
      cached: expData.cached || chain?.cached || history?.cached || false,
    });
  } catch (error) {
    console.error("polygon-options error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch polygon options" },
      { status: 500 },
    );
  }
}
