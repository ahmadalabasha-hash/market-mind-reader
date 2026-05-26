export type MarketQuote = {
  symbol: string;
  contract: string;
  latest: string;
  change: string;
  high: string;
  low: string;
  volume: string;
  time: string;
  up: boolean;
};

const symbols = [
  { symbol: "SPY", contract: "S&P 500" },
  { symbol: "QQQ", contract: "Nasdaq 100" },
  { symbol: "IWM", contract: "Russell 2000" },
  { symbol: "GLD", contract: "Gold" },
  { symbol: "USO", contract: "Crude Oil" },
  { symbol: "TLT", contract: "20+ Year Treasury" },
  { symbol: "OANDA:EUR_USD", contract: "EUR/USD" },
  { symbol: "OANDA:USD_JPY", contract: "USD/JPY" },
];

function formatNumber(value: number | undefined, digits = 2): string {
  if (value === undefined || Number.isNaN(value)) return "—";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatPrice(value: number | undefined, symbol: string) {
  if (value === undefined || Number.isNaN(value)) return "—";
  const fx = symbol.startsWith("OANDA:");
  const digits = fx ? 4 : 2;
  return formatNumber(value, digits);
}

function formatPercent(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(2)}%`;
}

function formatVolume(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return "—";
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return String(Math.round(value));
}

function formatTime(epochSeconds?: number) {
  if (!epochSeconds) return "—";
  return new Date(epochSeconds * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchFinnhubQuote(
  symbol: string,
  apiKey: string,
): Promise<MarketQuote> {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const payload = await res.json();

  const latest = payload?.c;
  const change = payload?.d;
  const changePercent = payload?.dp;
  const high = payload?.h;
  const low = payload?.l;
  const volume = payload?.v;
  const time = payload?.t;

  return {
    symbol,
    contract: symbols.find((item) => item.symbol === symbol)?.contract || symbol,
    latest: formatPrice(latest, symbol),
    change: formatPercent(changePercent),
    high: formatPrice(high, symbol),
    low: formatPrice(low, symbol),
    volume: formatVolume(volume),
    time: formatTime(time),
    up: typeof change === "number" ? change >= 0 : false,
  };
}

export async function fetchMarketQuotes(): Promise<MarketQuote[]> {
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (!finnhubKey) {
    console.warn(
      "No FINNHUB_API_KEY set; market overview will use placeholder data.",
    );
    return symbols.map((item) => ({
      symbol: item.symbol,
      contract: item.contract,
      latest: "—",
      change: "—",
      high: "—",
      low: "—",
      volume: "—",
      time: "—",
      up: false,
    }));
  }

  try {
    const quotes = await Promise.all(
      symbols.map((item) => fetchFinnhubQuote(item.symbol, finnhubKey)),
    );
    return quotes;
  } catch (error) {
    console.error("Failed to fetch market quotes from Finnhub:", error);
    return symbols.map((item) => ({
      symbol: item.symbol,
      contract: item.contract,
      latest: "—",
      change: "—",
      high: "—",
      low: "—",
      volume: "—",
      time: "—",
      up: false,
    }));
  }
}
