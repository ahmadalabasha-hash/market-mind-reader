/**
 * Intraday Forecasting Models
 * Short-term price predictions for day trading (1h, 4h, next-day targets)
 */

export interface IntradayForecast {
  symbol: string;
  timestamp: number;
  currentPrice: number;
  horizon: '1h' | '4h' | '1d';
  targetPrice: number;
  confidence: number; // 0-100
  probabilityUp: number; // 0-100
  probabilityDown: number; // 0-100
  expectedMove: number;
  riskReward: number;
  stopLoss: number;
  takeProfit: number;
  indicators: {
    rsi: number;
    macd: number;
    bollingerUpper: number;
    bollingerLower: number;
    volumeTrend: 'increasing' | 'decreasing' | 'neutral';
    momentum: 'bullish' | 'bearish' | 'neutral';
  };
  signals: string[];
}

export interface SupportResistanceLevel {
  price: number;
  type: 'support' | 'resistance';
  strength: 'weak' | 'moderate' | 'strong';
  touches: number;
  lastTouched: number;
}

export interface TechnicalIndicators {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    width: number;
  };
  ema: {
    ema9: number;
    ema21: number;
    ema50: number;
  };
  volume: {
    current: number;
    average: number;
    ratio: number;
  };
  atr: number;
  volatility: number;
}

/**
 * Calculate technical indicators from OHLCV data
 */
export function calculateTechnicalIndicators(
  candles: Array<{ open: number; high: number; low: number; close: number; volume: number }>
): TechnicalIndicators {
  if (candles.length < 50) {
    // Return default values if insufficient data
    return {
      rsi: 50,
      macd: { value: 0, signal: 0, histogram: 0 },
      bollinger: { upper: 0, middle: 0, lower: 0, width: 0 },
      ema: { ema9: 0, ema21: 0, ema50: 0 },
      volume: { current: 0, average: 0, ratio: 1 },
      atr: 0,
      volatility: 0
    };
  }

  const closes = candles.map(c => c.close);
  const current = candles[candles.length - 1];

  // RSI (14-period)
  const rsi = calculateRSI(closes, 14);

  // MACD (12, 26, 9)
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdValue = ema12 - ema26;
  const macdSignal = calculateEMA([...candles.slice(-9).map(c => c.close), macdValue], 9);
  const macdHistogram = macdValue - macdSignal;

  // Bollinger Bands (20, 2)
  const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const std20 = Math.sqrt(
    closes.slice(-20).reduce((sum, c) => sum + Math.pow(c - sma20, 2), 0) / 20
  );
  const bollingerUpper = sma20 + 2 * std20;
  const bollingerLower = sma20 - 2 * std20;

  // EMAs
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const ema50 = calculateEMA(closes, 50);

  // Volume
  const volumes = candles.map(c => c.volume);
  const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const volumeRatio = current.volume / avgVolume;

  // ATR (14-period)
  const atr = calculateATR(candles, 14);

  // Volatility (using ATR)
  const volatility = atr / current.close;

  return {
    rsi,
    macd: {
      value: macdValue,
      signal: macdSignal,
      histogram: macdHistogram
    },
    bollinger: {
      upper: bollingerUpper,
      middle: sma20,
      lower: bollingerLower,
      width: (bollingerUpper - bollingerLower) / sma20
    },
    ema: { ema9, ema21, ema50 },
    volume: {
      current: current.volume,
      average: avgVolume,
      ratio: volumeRatio
    },
    atr,
    volatility
  };
}

/**
 * Calculate RSI
 */
function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate EMA
 */
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;

  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate ATR
 */
function calculateATR(
  candles: Array<{ high: number; low: number; close: number }>,
  period: number
): number {
  if (candles.length < period + 1) return 0;

  let trSum = 0;

  for (let i = candles.length - period; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    trSum += tr;
  }

  return trSum / period;
}

/**
 * Identify support and resistance levels
 */
export function identifySupportResistance(
  candles: Array<{ high: number; low: number; close: number }>,
  numLevels: number = 5
): SupportResistanceLevel[] {
  const levels: SupportResistanceLevel[] = [];
  const pivots: { price: number; type: 'high' | 'low'; index: number }[] = [];

  // Find pivot points (local highs and lows)
  for (let i = 2; i < candles.length - 2; i++) {
    const prevHigh = candles[i - 1].high;
    const currentHigh = candles[i].high;
    const nextHigh = candles[i + 1].high;

    const prevLow = candles[i - 1].low;
    const currentLow = candles[i].low;
    const nextLow = candles[i + 1].low;

    // Local high
    if (currentHigh > prevHigh && currentHigh > nextHigh) {
      pivots.push({ price: currentHigh, type: 'high', index: i });
    }

    // Local low
    if (currentLow < prevLow && currentLow < nextLow) {
      pivots.push({ price: currentLow, type: 'low', index: i });
    }
  }

  // Cluster nearby pivots
  const clustered = clusterPivots(pivots, 0.02); // 2% clustering

  // Calculate strength based on touches
  clustered.forEach(cluster => {
    const type = cluster.type === 'high' ? 'resistance' : 'support';
    const touches = countTouches(candles, cluster.price, 0.01);
    const strength = touches >= 3 ? 'strong' : touches >= 2 ? 'moderate' : 'weak';

    levels.push({
      price: cluster.price,
      type,
      strength,
      touches,
      lastTouched: Date.now()
    });
  });

  // Sort by strength and return top levels
  return levels
    .sort((a, b) => {
      const strengthOrder = { strong: 3, moderate: 2, weak: 1 };
      return strengthOrder[b.strength] - strengthOrder[a.strength];
    })
    .slice(0, numLevels);
}

/**
 * Cluster nearby pivot points
 */
function clusterPivots(
  pivots: { price: number; type: 'high' | 'low'; index: number }[],
  threshold: number
): { price: number; type: 'high' | 'low' }[] {
  const clustered: { price: number; type: 'high' | 'low' }[] = [];

  pivots.forEach(pivot => {
    const existing = clustered.find(c => Math.abs(c.price - pivot.price) / pivot.price < threshold);
    if (existing) {
      existing.price = (existing.price + pivot.price) / 2;
    } else {
      clustered.push({ price: pivot.price, type: pivot.type });
    }
  });

  return clustered;
}

/**
 * Count how many times price touched a level
 */
function countTouches(
  candles: Array<{ high: number; low: number }>,
  level: number,
  threshold: number
): number {
  return candles.filter(c => 
    Math.abs(c.high - level) / level < threshold || 
    Math.abs(c.low - level) / level < threshold
  ).length;
}

/**
 * Generate intraday forecast
 */
export function generateIntradayForecast(
  symbol: string,
  candles: Array<{ open: number; high: number; low: number; close: number; volume: number }>,
  horizon: '1h' | '4h' | '1d'
): IntradayForecast {
  const current = candles[candles.length - 1];
  const indicators = calculateTechnicalIndicators(candles);
  const supportResistance = identifySupportResistance(candles);

  // Calculate expected move based on ATR and volatility
  const atrMultiplier = horizon === '1h' ? 0.5 : horizon === '4h' ? 1 : 2;
  const expectedMove = indicators.atr * atrMultiplier;

  // Determine direction based on indicators
  const bullishSignals = [
    indicators.rsi < 30, // Oversold
    indicators.macd.histogram > 0, // MACD bullish
    current.close > indicators.ema.ema9, // Above short EMA
    indicators.ema.ema9 > indicators.ema.ema21, // EMA bullish cross
    indicators.volume.ratio > 1.5 // High volume
  ].filter(Boolean).length;

  const bearishSignals = [
    indicators.rsi > 70, // Overbought
    indicators.macd.histogram < 0, // MACD bearish
    current.close < indicators.ema.ema9, // Below short EMA
    indicators.ema.ema9 < indicators.ema.ema21, // EMA bearish cross
    indicators.volume.ratio > 1.5 // High volume (can be either direction)
  ].filter(Boolean).length;

  const isBullish = bullishSignals > bearishSignals;
  const direction = isBullish ? 1 : -1;

  // Calculate target price
  const targetPrice = current.close + (expectedMove * direction);

  // Calculate confidence based on signal strength
  const signalStrength = Math.abs(bullishSignals - bearishSignals);
  const confidence = Math.min(100, signalStrength * 20);

  // Calculate probabilities
  const probabilityUp = isBullish ? 50 + confidence / 2 : 50 - confidence / 2;
  const probabilityDown = 100 - probabilityUp;

  // Calculate risk/reward
  const nearestSupport = supportResistance
    .filter(l => l.type === 'support' && l.price < current.close)
    .sort((a, b) => b.price - a.price)[0];
  
  const nearestResistance = supportResistance
    .filter(l => l.type === 'resistance' && l.price > current.close)
    .sort((a, b) => a.price - b.price)[0];

  const stopLoss = nearestSupport ? nearestSupport.price : current.close - expectedMove;
  const takeProfit = nearestResistance ? nearestResistance.price : current.close + expectedMove;
  const riskReward = Math.abs(takeProfit - current.close) / Math.abs(current.close - stopLoss);

  // Generate signals
  const signals: string[] = [];
  if (indicators.rsi < 30) signals.push('RSI Oversold - Buy Signal');
  if (indicators.rsi > 70) signals.push('RSI Overbought - Sell Signal');
  if (indicators.macd.histogram > 0 && indicators.macd.value > indicators.macd.signal) {
    signals.push('MACD Bullish Cross');
  }
  if (indicators.macd.histogram < 0 && indicators.macd.value < indicators.macd.signal) {
    signals.push('MACD Bearish Cross');
  }
  if (current.close < indicators.bollinger.lower) signals.push('Below Lower Bollinger - Oversold');
  if (current.close > indicators.bollinger.upper) signals.push('Above Upper Bollinger - Overbought');
  if (indicators.volume.ratio > 2) signals.push('Volume Spike Detected');

  return {
    symbol,
    timestamp: Date.now(),
    currentPrice: current.close,
    horizon,
    targetPrice,
    confidence,
    probabilityUp,
    probabilityDown,
    expectedMove,
    riskReward,
    stopLoss,
    takeProfit,
    indicators: {
      rsi: indicators.rsi,
      macd: indicators.macd.value,
      bollingerUpper: indicators.bollinger.upper,
      bollingerLower: indicators.bollinger.lower,
      volumeTrend: indicators.volume.ratio > 1.2 ? 'increasing' : indicators.volume.ratio < 0.8 ? 'decreasing' : 'neutral',
      momentum: isBullish ? 'bullish' : 'bearish'
    },
    signals
  };
}

/**
 * Generate mock intraday forecast
 */
export function generateMockIntradayForecast(
  symbol: string,
  horizon: '1h' | '4h' | '1d'
): IntradayForecast {
  const currentPrice = 100 + Math.random() * 50;
  const expectedMove = currentPrice * (0.01 + Math.random() * 0.02);
  const isBullish = Math.random() > 0.5;
  const targetPrice = currentPrice + (expectedMove * (isBullish ? 1 : -1));
  const confidence = 50 + Math.random() * 40;
  const probabilityUp = isBullish ? 50 + confidence / 2 : 50 - confidence / 2;
  const probabilityDown = 100 - probabilityUp;

  return {
    symbol,
    timestamp: Date.now(),
    currentPrice,
    horizon,
    targetPrice,
    confidence,
    probabilityUp,
    probabilityDown,
    expectedMove,
    riskReward: 1.5 + Math.random(),
    stopLoss: currentPrice - expectedMove * 0.5,
    takeProfit: currentPrice + expectedMove * 1.5,
    indicators: {
      rsi: 30 + Math.random() * 40,
      macd: (Math.random() - 0.5) * 2,
      bollingerUpper: currentPrice * 1.02,
      bollingerLower: currentPrice * 0.98,
      volumeTrend: ['increasing', 'decreasing', 'neutral'][Math.floor(Math.random() * 3)] as any,
      momentum: isBullish ? 'bullish' : 'bearish'
    },
    signals: isBullish 
      ? ['RSI Oversold - Buy Signal', 'MACD Bullish Cross', 'Volume Spike Detected']
      : ['RSI Overbought - Sell Signal', 'MACD Bearish Cross']
  };
}
