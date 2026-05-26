export const dynamic = "force-dynamic";

const cleanSymbol = (symbol: string) => {
  const normalized = symbol.trim().toUpperCase().split(":").pop() || "";

  const indexMap: Record<string, string> = {
    SPX: "^SPX",
    GSPC: "^GSPC",
    SP500: "^GSPC",
    "^SP500": "^GSPC",
    DJI: "^DJI",
    NDX: "^NDX",
    RUT: "^RUT",
  };

  if (normalized.startsWith("^")) {
    return normalized;
  }

  return indexMap[normalized] ?? normalized;
};

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

async function fetchCandlesFromYahoo(symbol: string, resolution: string) {
  const cleanedSymbol = cleanSymbol(symbol);
  const interval = getYahooInterval(resolution);
  const range = "5d";
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    cleanedSymbol,
  )}?interval=${encodeURIComponent(interval)}&range=${encodeURIComponent(
    range,
  )}&includePrePost=false`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Yahoo Finance error ${res.status}`);
  }

  const data = await res.json();
  const chartError = data?.chart?.error;

  if (chartError) {
    const description =
      chartError.description || chartError.code || JSON.stringify(chartError);
    throw new Error(`Yahoo Finance chart error: ${description}`);
  }

  const result = data?.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];

  if (!result || !Array.isArray(result.timestamp) || !quote) {
    throw new Error(
      `Invalid Yahoo Finance response: ${JSON.stringify(
        data?.chart?.error ?? data,
      )}`,
    );
  }

  const timestamps = result.timestamp as number[];
  const quoteData = quote as {
    open?: Array<number | null>;
    high?: Array<number | null>;
    low?: Array<number | null>;
    close?: Array<number | null>;
    volume?: Array<number | null>;
  };

  const candles = timestamps
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
    .filter((c): c is {
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      time: number;
    } => c !== null);

  return candles;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const symbol = url.searchParams.get("symbol") || "";
    const resolution = url.searchParams.get("resolution") || "60";

    if (!symbol) {
      return Response.json({ error: "Symbol is required" }, { status: 400 });
    }

    const candles = await fetchCandlesFromYahoo(symbol, resolution);

    if (!Array.isArray(candles) || candles.length === 0) {
      return Response.json(
        { error: "No market candles available for the requested symbol." },
        { status: 404 },
      );
    }

    return Response.json({ candles });
  } catch (error) {
    console.error("Market data request failed:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 502 },
    );
  }
}
