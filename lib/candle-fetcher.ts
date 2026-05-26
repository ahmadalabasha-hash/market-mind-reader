/**
 * Fetch live OHLCV candles from Finnhub API
 */

export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  time: number;
}

// Popular symbols for options trading
export const POPULAR_SYMBOLS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "MSFT", name: "Microsoft Corp" },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp" },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "AVGO", name: "Broadcom Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "QQQ", name: "Invesco QQQ Trust" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF" },
  { symbol: "IWM", name: "iShares Russell 2000" },
  { symbol: "GLD", name: "SPDR Gold Shares" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury" },
  { symbol: "EEM", name: "iShares MSCI Emerging Markets" },
  { symbol: "XLF", name: "Financial Select Sector" },
  { symbol: "XLV", name: "Health Care Select Sector" },
  { symbol: "XLE", name: "Energy Select Sector" },
  { symbol: "XLK", name: "Technology Select Sector" },
  { symbol: "USO", name: "United States Oil Fund" },
  { symbol: "DIA", name: "SPDR Dow Jones Industrial" },
  { symbol: "SPLG", name: "SPDR Portfolio S&P 500" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF" },
  { symbol: "VTI", name: "Vanguard Total Stock Market" },
];

/**
 * Fetch intraday candles from Finnhub
 * Returns the last 5 candles for gamma level calculation
 */
export async function fetchLiveCandles(
  symbol: string,
  resolution: string = "60",
): Promise<Candle[]> {
  if (!symbol) {
    throw new Error("Missing symbol");
  }

  const response = await fetch(
    `/api/market-data?symbol=${encodeURIComponent(symbol)}&resolution=${encodeURIComponent(
      resolution,
    )}`,
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Market data error: ${response.status} ${body}`);
  }

  const data = await response.json();

  if (!Array.isArray(data.candles)) {
    throw new Error("Invalid market data response");
  }

  return data.candles;
}

const normalizeSymbol = (symbol: string) =>
  symbol.trim().toUpperCase().split(":").pop() || "";

const getYahooInterval = (resolution: string) => {
  if (resolution === "60") {
    return "60m";
  }
  if (resolution === "15") {
    return "15m";
  }
  if (resolution === "30") {
    return "30m";
  }
  if (resolution === "1") {
    return "1m";
  }
  return `${resolution}m`;
};

export async function fetchCandlesFromYahoo(
  symbol: string,
  resolution: string = "60",
): Promise<Candle[]> {
  const cleanedSymbol = normalizeSymbol(symbol);
  const interval = getYahooInterval(resolution);
  const range = "5d";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    cleanedSymbol,
  )}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(
    range,
  )}&includePrePost=false`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Yahoo Finance error: ${res.status}`);
  }

  const data = await res.json();
  const result = data?.chart?.result?.[0];

  if (!result || !Array.isArray(result.timestamp) || !result.indicators?.quote?.[0]) {
    throw new Error("Invalid Yahoo Finance response");
  }

  const timestamps = result.timestamp as number[];
  const quoteData = result.indicators.quote[0] as {
    open?: Array<number | null>;
    high?: Array<number | null>;
    low?: Array<number | null>;
    close?: Array<number | null>;
    volume?: Array<number | null>;
  };

  const candles: Candle[] = timestamps
    .map((timestamp, idx) => {
      const open = quoteData.open?.[idx] ?? null;
      const high = quoteData.high?.[idx] ?? null;
      const low = quoteData.low?.[idx] ?? null;
      const close = quoteData.close?.[idx] ?? null;
      const volume = quoteData.volume?.[idx] ?? 0;

      if ([open, high, low, close].some((value) => value == null)) {
        return null;
      }

      return {
        open,
        high,
        low,
        close,
        volume,
        time: timestamp * 1000,
      };
    })
    .filter((c): c is Candle => c !== null);

  return candles.slice(-5);
}

/**
 * Get current quote for a symbol
 */
export async function fetchCurrentQuote(
  symbol: string,
  apiKey: string,
): Promise<{
  price: number;
  high: number;
  low: number;
  open: number;
  volume: number;
} | null> {
  if (!apiKey || !symbol) {
    return null;
  }

  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
      symbol,
    )}&token=${apiKey}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Finnhub API error: ${res.status}`);
    }

    const data = await res.json();

    return {
      price: data.c || 0,
      high: data.h || 0,
      low: data.l || 0,
      open: data.o || 0,
      volume: data.pc || 0,
    };
  } catch (error) {
    console.error(`Failed to fetch quote for ${symbol}:`, error);
    return null;
  }
}
