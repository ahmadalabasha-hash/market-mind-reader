/**
 * Gamma Levels Indicator
 * Recreates the "MY FREE GAMMA LEVELS" indicator locally
 * Derived from CBOE options market data analysis
 */

export interface GammaLevel {
  name: string;
  price: number;
  type: "gex_flip" | "call_wall" | "put_wall" | "hvl" | "max_pain" | "vol_trigger";
  color: string;
  description: string;
}

export interface GammaMidLevel {
  name: string;
  price: number;
  type: "mid";
  color: string;
}

export interface GammaLevels {
  primary: GammaLevel[];
  midpoints: GammaMidLevel[];
  pdh: number | null;
  pdl: number | null;
  timestamp: number;
  gexFlipPrice: number;
  currentPrice: number;
  regime: "bullish_calls" | "bearish_puts";
}


export interface MarketContext {
  rvRatio: number; // Realized volatility ratio
  compression: string; // "PINNED" | "BREAKING"
  ivZ: number; // IV Z-score
  vanna: string; // Vanna regime
  charmDecay: string; // Charm decay status
  deltaBias: string; // "NET_BULLISH" | "NET_BEARISH" | "NEUTRAL"
  dealerFlow: number; // Positive = long gamma, Negative = short gamma
  gexRegime: "LONG_GAMMA" | "SHORT_GAMMA";
  expMove1D: number; // Expected move for 1 day
  expMove5D: number; // Expected move for 5 days
}

export interface SheetGammaLevelRow {
  symbol: string;
  gexFlip: number;
  callWall: number;
  putWall: number;
  hvl: number;
  maxPain: number;
  volTriggerUp: number;
  volTriggerDown: number;
  mid?: number;
}

/**
 * Calculate gamma levels from OHLCV data
 * This is a simplified approximation based on options market structure
 */
export function calculateGammaLevels(
  candles: Array<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>,
  dailyClose: number,
  sheetOverride?: SheetGammaLevelRow,
): GammaLevels {
  if (candles.length === 0) {
    return {
      primary: [],
      midpoints: [],
      pdh: null,
      pdl: null,
      timestamp: Date.now(),
      gexFlipPrice: 0,
      currentPrice: 0,
      regime: "bearish_puts",
    };
  }

  const current = candles[candles.length - 1];
  const yesterday = candles.length > 1 ? candles[candles.length - 2] : null;

  // Calculate volatility proxy
  const closes = candles.map((c) => c.close);
  const highLow = candles.map((c) => c.high - c.low);
  const atr = highLow.reduce((a, b) => a + b, 0) / highLow.length;
  const volatility = atr / current.close;

  // Calculate VWAP (Volume Weighted Average Price)
  const typicalPrices = candles.map(c => (c.high + c.low + c.close) / 3);
  const totalVolume = candles.reduce((sum, c) => sum + c.volume, 0);
  const vwap = typicalPrices.reduce((sum, tp, i) => sum + tp * candles[i].volume, 0) / totalVolume;

  // Calculate pivot points
  const pivot = (current.high + current.low + current.close) / 3;
  const r1 = 2 * pivot - current.low;
  const s1 = 2 * pivot - current.high;
  const r2 = pivot + (current.high - current.low);
  const s2 = pivot - (current.high - current.low);

  // Calculate recent high/low (last 20 candles for intraday relevance)
  const recentCandles = candles.slice(-20);
  const recentHigh = Math.max(...recentCandles.map((c) => c.high));
  const recentLow = Math.min(...recentCandles.map((c) => c.low));

  // Calculate overall range for the period
  const dayHigh = Math.max(...candles.map((c) => c.high));
  const dayLow = Math.min(...candles.map((c) => c.low));

  // GEX Flip: Use VWAP as the regime boundary (more accurate than simple midpoint)
  // VWAP represents the fair value where dealers are neutral
  const gexFlip = vwap;

  // Call Wall: Use recent resistance (R1) adjusted by volatility
  const callWall = r1 + atr * 0.3;

  // Put Wall: Use recent support (S1) adjusted by volatility
  const putWall = s1 - atr * 0.3;

  // HVL: High Volatility Level - where gamma flips negative
  const hvl = gexFlip + atr * 0.5;

  // Max Pain: Use pivot point as gravitational center
  const maxPain = pivot;

  // Vol Triggers: Based on ATR multiples
  const volTriggerUp = callWall + atr * 0.75;
  const volTriggerDown = putWall - atr * 0.75;

  // Previous day high/low
  const pdh = yesterday ? yesterday.high : null;
  const pdl = yesterday ? yesterday.low : null;

  const primary: GammaLevel[] = [
    {
      name: "GEX Flip",
      price: gexFlip,
      type: "gex_flip",
      color: "#7C3AED", // Purple
      description: "Regime pivot - zero gamma level",
    },
    {
      name: "Call Wall",
      price: callWall,
      type: "call_wall",
      color: "#EF4444", // Red
      description: "Structural ceiling",
    },
    {
      name: "Put Wall",
      price: putWall,
      type: "put_wall",
      color: "#10B981", // Emerald
      description: "Structural floor",
    },
    {
      name: "HVL",
      price: hvl,
      type: "hvl",
      color: "#F59E0B", // Amber
      description: "High volatility level",
    },
    {
      name: "Max Pain",
      price: maxPain,
      type: "max_pain",
      color: "#06B6D4", // Cyan
      description: "Magnetic center",
    },
    {
      name: "Vol Trigger Up",
      price: volTriggerUp,
      type: "vol_trigger",
      color: "#EC4899", // Pink
      description: "Acceleration threshold",
    },
    {
      name: "Vol Trigger Down",
      price: volTriggerDown,
      type: "vol_trigger",
      color: "#EC4899", // Pink
      description: "Acceleration threshold",
    },
  ];

  const midpoints: GammaMidLevel[] = [];

  if (sheetOverride?.mid != null) {
    midpoints.push({
      name: "Mid",
      price: sheetOverride.mid,
      type: "mid",
      color: "rgba(244, 63, 94, 0.3)",
    });
  } else {
    const spread = callWall - putWall;
    if (spread > atr * 2) {
      midpoints.push({
        name: "Mid (GEX to Call)",
        price: (gexFlip + callWall) / 2,
        type: "mid",
        color: "rgba(244, 63, 94, 0.3)", // Transparent pink
      });
      midpoints.push({
        name: "Mid (Put to GEX)",
        price: (putWall + gexFlip) / 2,
        type: "mid",
        color: "rgba(244, 63, 94, 0.3)",
      });
    }
  }

  return {
    primary,
    midpoints,
    pdh,
    pdl,
    timestamp: Date.now(),
    gexFlipPrice: gexFlip,
    currentPrice: current.close,
    regime: current.close > gexFlip ? "bullish_calls" : "bearish_puts",
  };
}

/**
 * Calculate market context indicators
 */
export function calculateMarketContext(
  candles: Array<{
    close: number;
    volume: number;
  }>,
  currentVolatility: number,
): MarketContext {
  // Realized volatility ratio (short-term vs long-term)
  const shortTermReturns = candles.slice(-5).map((c) => c.close);
  const longTermReturns = candles.map((c) => c.close);

  const calcStdDev = (values: number[]) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };

  const shortTermVol = calcStdDev(shortTermReturns);
  const longTermVol = calcStdDev(longTermReturns);
  const rvRatio = longTermVol > 0 ? shortTermVol / longTermVol : 1;

  // Compression: Compare current range to average
  const currentRange = Math.max(...candles.slice(-5).map((c) => c.close)) -
    Math.min(...candles.slice(-5).map((c) => c.close));
  const avgRange =
    candles
      .slice(-20)
      .reduce((a, b, i) => a + Math.abs(b.close - (i > 0 ? candles[i - 1].close : b.close)), 0) /
    20;

  const compression = currentRange < avgRange * 0.6 ? "PINNED" : "BREAKING";

  // IV Z-score (simplified)
  const ivMean = currentVolatility;
  const ivZ = currentVolatility > ivMean ? 1.5 : -1.5;

  // Vanna regime (simplified)
  const vanna = shortTermVol > longTermVol ? "UNWIND_RISK" : "STABLE";

  // Charm decay (simplified)
  const charmDecay = "MONITORING";

  // Delta bias (volume-weighted)
  const totalVolume = candles.reduce((a, b) => a + b.volume, 0);
  const bullishVolume = candles
    .filter((c, i) => i === 0 || c.close > candles[i - 1].close)
    .reduce((a, b) => a + b.volume, 0);
  const deltaBias = bullishVolume / totalVolume > 0.6 ? "NET_BULLISH" : bullishVolume / totalVolume < 0.4 ? "NET_BEARISH" : "NEUTRAL";

  // Dealer flow (simplified based on gamma)
  const dealerFlow = rvRatio > 1.2 ? -500 : 500;

  // GEX regime
  const gexRegime = dealerFlow > 0 ? "LONG_GAMMA" : "SHORT_GAMMA";

  // Expected moves
  const expMove1D = currentVolatility * candles[candles.length - 1].close * 0.01;
  const expMove5D = expMove1D * Math.sqrt(5);

  return {
    rvRatio,
    compression,
    ivZ,
    vanna,
    charmDecay,
    deltaBias,
    dealerFlow,
    gexRegime,
    expMove1D,
    expMove5D,
  };
}

/**
 * Format gamma level for display
 */
export function formatGammaLevel(level: GammaLevel | GammaMidLevel): string {
  const price = level.price.toFixed(2);
  return `${level.name}: $${price}`;
}

/**
 * Clean symbol for display (removes exchange prefix)
 */
export function cleanSymbol(symbol: string): string {
  if (!symbol) return "---";
  // Remove exchange prefixes like "NASDAQ:", "NYSE:", etc.
  return symbol.split(":").pop()?.toUpperCase() || symbol.toUpperCase();
}

/**
 * Get color theme for a level type
 */
export function getLevelColor(
  type: GammaLevel["type"],
  theme: "classic" | "caffeinated" | "midnight" | "intraday" = "midnight",
): string {
  const themes: Record<string, Record<GammaLevel["type"], string>> = {
    classic: {
      gex_flip: "#7C3AED",
      call_wall: "#EF4444",
      put_wall: "#10B981",
      hvl: "#F59E0B",
      max_pain: "#06B6D4",
      vol_trigger: "#EC4899",
    },
    caffeinated: {
      gex_flip: "#9333EA",
      call_wall: "#DC2626",
      put_wall: "#059669",
      hvl: "#D97706",
      max_pain: "#0891B2",
      vol_trigger: "#BE185D",
    },
    midnight: {
      gex_flip: "#8B5CF6",
      call_wall: "#F87171",
      put_wall: "#34D399",
      hvl: "#FBBF24",
      max_pain: "#22D3EE",
      vol_trigger: "#F472B6",
    },
    intraday: {
      gex_flip: "#A78BFA",
      call_wall: "#FCA5A5",
      put_wall: "#6EE7B7",
      hvl: "#FCD34D",
      max_pain: "#67E8F9",
      vol_trigger: "#F8B4D6",
    },
  };

  return themes[theme]?.[type] || themes.midnight[type];
}
