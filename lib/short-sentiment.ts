/**
 * Short Interest and Sentiment Analysis
 * Tracks short selling activity, short interest ratios, and market sentiment
 */

export interface ShortInterestData {
  symbol: string;
  timestamp: number;
  sharesShort: number;
  shortRatio: number; // Days to cover
  shortPercentOfFloat: number;
  avgDailyVolume: number;
  sharesShortPriorMonth: number;
  shortInterestChange: number; // Percentage change
  sentiment: 'bearish' | 'neutral' | 'bullish';
}

export interface SentimentIndicator {
  symbol: string;
  timestamp: number;
  shortInterestRatio: number; // 0-100
  putCallRatio: number;
  impliedVolatility: number;
  newsSentiment: number; // -100 to 100
  socialSentiment: number; // -100 to 100
  institutionalFlow: number; // -100 to 100
  overallSentiment: number; // -100 to 100
  trend: 'improving' | 'deteriorating' | 'stable';
}

export interface ShortSqueezeAlert {
  symbol: string;
  timestamp: number;
  type: 'high_short_interest' | 'rising_shorts' | 'squeeze_potential' | 'squeeze_in_progress';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  description: string;
  metrics: {
    shortRatio: number;
    shortPercentOfFloat: number;
    recentPriceChange: number;
    volumeSpike: number;
  };
}

/**
 * Calculate short interest sentiment score
 */
export function calculateShortSentiment(data: ShortInterestData): {
  score: number; // -100 to 100
  sentiment: 'bearish' | 'neutral' | 'bullish';
  squeezePotential: number; // 0-100
} {
  // High short interest = bearish sentiment but squeeze potential
  const shortInterestScore = -data.shortPercentOfFloat;
  
  // Rising shorts = more bearish
  const shortChangeScore = -data.shortInterestChange * 0.5;
  
  // Days to cover: high = squeeze potential
  const squeezePotential = Math.min(100, data.shortRatio * 10);
  
  // Combined score
  let score = shortInterestScore + shortChangeScore;
  score = Math.max(-100, Math.min(100, score));
  
  const sentiment = score < -30 ? 'bearish' : score > 30 ? 'bullish' : 'neutral';
  
  return { score, sentiment, squeezePotential };
}

/**
 * Detect short squeeze opportunities
 */
export function detectShortSqueeze(
  shortData: ShortInterestData,
  priceData: { currentPrice: number; priceChange24h: number; volume24h: number; avgVolume: number }
): ShortSqueezeAlert | null {
  const { shortRatio, shortPercentOfFloat, shortInterestChange } = shortData;
  const { priceChange24h, volume24h, avgVolume } = priceData;
  
  // High short interest (> 20%)
  if (shortPercentOfFloat > 20) {
    return {
      symbol: shortData.symbol,
      timestamp: Date.now(),
      type: 'high_short_interest',
      severity: shortPercentOfFloat > 40 ? 'extreme' : shortPercentOfFloat > 30 ? 'high' : 'medium',
      description: `High short interest: ${shortPercentOfFloat.toFixed(1)}% of float`,
      metrics: {
        shortRatio,
        shortPercentOfFloat,
        recentPriceChange: priceChange24h,
        volumeSpike: volume24h / avgVolume
      }
    };
  }
  
  // Rising shorts (> 10% increase)
  if (shortInterestChange > 10) {
    return {
      symbol: shortData.symbol,
      timestamp: Date.now(),
      type: 'rising_shorts',
      severity: shortInterestChange > 30 ? 'high' : 'medium',
      description: `Short interest rising: +${shortInterestChange.toFixed(1)}%`,
      metrics: {
        shortRatio,
        shortPercentOfFloat,
        recentPriceChange: priceChange24h,
        volumeSpike: volume24h / avgVolume
      }
    };
  }
  
  // Squeeze potential (high short ratio + price up + volume spike)
  if (shortRatio > 5 && priceChange24h > 5 && volume24h > avgVolume * 2) {
    return {
      symbol: shortData.symbol,
      timestamp: Date.now(),
      type: 'squeeze_potential',
      severity: 'high',
      description: `Short squeeze potential: ${shortRatio.toFixed(1)} days to cover`,
      metrics: {
        shortRatio,
        shortPercentOfFloat,
        recentPriceChange: priceChange24h,
        volumeSpike: volume24h / avgVolume
      }
    };
  }
  
  // Squeeze in progress (extreme conditions)
  if (shortRatio > 10 && priceChange24h > 20 && volume24h > avgVolume * 5) {
    return {
      symbol: shortData.symbol,
      timestamp: Date.now(),
      type: 'squeeze_in_progress',
      severity: 'extreme',
      description: `SHORT SQUEEZE IN PROGRESS: ${shortRatio.toFixed(1)} days to cover`,
      metrics: {
        shortRatio,
        shortPercentOfFloat,
        recentPriceChange: priceChange24h,
        volumeSpike: volume24h / avgVolume
      }
    };
  }
  
  return null;
}

/**
 * Calculate overall sentiment from multiple sources
 */
export function calculateOverallSentiment(indicators: Partial<SentimentIndicator>): {
  score: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-100
  trend: 'improving' | 'deteriorating' | 'stable';
} {
  const weights = {
    shortInterest: 0.2,
    putCallRatio: 0.15,
    impliedVolatility: 0.1,
    newsSentiment: 0.25,
    socialSentiment: 0.15,
    institutionalFlow: 0.15
  };
  
  let score = 0;
  let totalWeight = 0;
  
  if (indicators.shortInterestRatio !== undefined) {
    score += (indicators.shortInterestRatio - 50) * weights.shortInterest;
    totalWeight += weights.shortInterest;
  }
  
  if (indicators.putCallRatio !== undefined) {
    // PCR < 1 = bullish, > 1 = bearish
    const pcrScore = (1 - indicators.putCallRatio) * 50;
    score += pcrScore * weights.putCallRatio;
    totalWeight += weights.putCallRatio;
  }
  
  if (indicators.newsSentiment !== undefined) {
    score += indicators.newsSentiment * weights.newsSentiment;
    totalWeight += weights.newsSentiment;
  }
  
  if (indicators.socialSentiment !== undefined) {
    score += indicators.socialSentiment * weights.socialSentiment;
    totalWeight += weights.socialSentiment;
  }
  
  if (indicators.institutionalFlow !== undefined) {
    score += indicators.institutionalFlow * weights.institutionalFlow;
    totalWeight += weights.institutionalFlow;
  }
  
  // Normalize score
  if (totalWeight > 0) {
    score = score / totalWeight;
  }
  
  score = Math.max(-100, Math.min(100, score));
  
  const sentiment = score > 20 ? 'bullish' : score < -20 ? 'bearish' : 'neutral';
  
  // Confidence based on data availability
  const availableSignals = Object.values(indicators).filter(v => v !== undefined).length;
  const confidence = (availableSignals / 6) * 100;
  
  // Trend (simplified - in production use historical data)
  const trend = 'stable';
  
  return { score, sentiment, confidence, trend };
}

/**
 * Generate mock short interest data
 */
export function generateMockShortInterest(symbol: string): ShortInterestData {
  const sharesShort = Math.floor(Math.random() * 50000000) + 1000000;
  const floatShares = Math.floor(Math.random() * 500000000) + 50000000;
  const shortPercentOfFloat = (sharesShort / floatShares) * 100;
  const avgDailyVolume = Math.floor(Math.random() * 10000000) + 500000;
  const shortRatio = sharesShort / avgDailyVolume;
  const sharesShortPriorMonth = sharesShort * (0.8 + Math.random() * 0.4);
  const shortInterestChange = ((sharesShort - sharesShortPriorMonth) / sharesShortPriorMonth) * 100;
  
  return {
    symbol,
    timestamp: Date.now(),
    sharesShort,
    shortRatio,
    shortPercentOfFloat,
    avgDailyVolume,
    sharesShortPriorMonth,
    shortInterestChange,
    sentiment: shortPercentOfFloat > 15 ? 'bearish' : 'neutral'
  };
}

/**
 * Generate mock sentiment indicator
 */
export function generateMockSentimentIndicator(symbol: string): SentimentIndicator {
  return {
    symbol,
    timestamp: Date.now(),
    shortInterestRatio: Math.random() * 100,
    putCallRatio: 0.5 + Math.random() * 1.5,
    impliedVolatility: 0.15 + Math.random() * 0.5,
    newsSentiment: (Math.random() - 0.5) * 200,
    socialSentiment: (Math.random() - 0.5) * 200,
    institutionalFlow: (Math.random() - 0.5) * 200,
    overallSentiment: (Math.random() - 0.5) * 200,
    trend: ['improving', 'deteriorating', 'stable'][Math.floor(Math.random() * 3)] as any
  };
}
