/**
 * Options Flow Analysis
 * Tracks unusual options activity, dealer positioning, and institutional flow
 */

export interface OptionsFlow {
  symbol: string;
  timestamp: number;
  optionType: 'call' | 'put';
  strike: number;
  expiration: string;
  volume: number;
  openInterest: number;
  iv: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  price: number;
  totalValue: number;
  isUnusual: boolean;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  source: 'sweep' | 'block' | 'split' | 'retail';
}

export interface DealerPositioning {
  symbol: string;
  timestamp: number;
  netGamma: number; // Positive = long gamma, Negative = short gamma
  netDelta: number;
  netVega: number;
  callGamma: number;
  putGamma: number;
  totalGammaExposure: number;
  regime: 'long_gamma' | 'short_gamma' | 'neutral';
  flipLevel: number; // Price where gamma flips
}

export interface UnusualActivity {
  symbol: string;
  timestamp: number;
  type: 'large_sweep' | 'heavy_volume' | 'high_iv' | 'block_trade' | 'whale_alert';
  description: string;
  impact: 'high' | 'medium' | 'low';
  details: {
    strike?: number;
    expiration?: string;
    volume?: number;
    oi?: number;
    iv?: number;
    totalValue?: number;
  };
}

/**
 * Detect unusual options activity
 */
export function detectUnusualActivity(flow: OptionsFlow[]): UnusualActivity[] {
  const unusual: UnusualActivity[] = [];
  
  // Group by symbol
  const bySymbol = new Map<string, OptionsFlow[]>();
  flow.forEach(f => {
    if (!bySymbol.has(f.symbol)) bySymbol.set(f.symbol, []);
    bySymbol.get(f.symbol)!.push(f);
  });
  
  bySymbol.forEach((flows, symbol) => {
    // Large sweep (> $1M notional)
    const largeSweeps = flows.filter(f => 
      f.source === 'sweep' && f.totalValue > 1000000
    );
    if (largeSweeps.length > 0) {
      unusual.push({
        symbol,
        timestamp: Date.now(),
        type: 'large_sweep',
        description: `Large sweep detected: ${largeSweeps.length} sweeps > $1M`,
        impact: 'high',
        details: {
          totalValue: largeSweeps.reduce((sum, f) => sum + f.totalValue, 0)
        }
      });
    }
    
    // Heavy volume (> 10x average OI)
    const heavyVolume = flows.filter(f => f.volume > f.openInterest * 10);
    if (heavyVolume.length > 0) {
      unusual.push({
        symbol,
        timestamp: Date.now(),
        type: 'heavy_volume',
        description: `Heavy volume: ${heavyVolume.length} contracts with 10x+ OI`,
        impact: 'medium',
        details: {
          volume: heavyVolume.reduce((sum, f) => sum + f.volume, 0)
        }
      });
    }
    
    // High IV (> 90th percentile)
    const avgIV = flows.reduce((sum, f) => sum + f.iv, 0) / flows.length;
    if (avgIV > 0.5) {
      unusual.push({
        symbol,
        timestamp: Date.now(),
        type: 'high_iv',
        description: `Elevated IV: ${(avgIV * 100).toFixed(1)}%`,
        impact: 'medium',
        details: { iv: avgIV }
      });
    }
    
    // Block trades
    const blocks = flows.filter(f => f.source === 'block');
    if (blocks.length > 0) {
      unusual.push({
        symbol,
        timestamp: Date.now(),
        type: 'block_trade',
        description: `${blocks.length} block trades detected`,
        impact: 'high',
        details: {
          totalValue: blocks.reduce((sum, f) => sum + f.totalValue, 0)
        }
      });
    }
  });
  
  return unusual.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Calculate dealer positioning from options flow
 */
export function calculateDealerPositioning(flow: OptionsFlow[]): DealerPositioning {
  if (flow.length === 0) {
    return {
      symbol: '',
      timestamp: Date.now(),
      netGamma: 0,
      netDelta: 0,
      netVega: 0,
      callGamma: 0,
      putGamma: 0,
      totalGammaExposure: 0,
      regime: 'neutral',
      flipLevel: 0
    };
  }
  
  const symbol = flow[0].symbol;
  
  // Calculate greeks (simplified - in production use actual options pricing model)
  const callGamma = flow
    .filter(f => f.optionType === 'call')
    .reduce((sum, f) => sum + f.gamma * f.volume, 0);
  
  const putGamma = flow
    .filter(f => f.optionType === 'put')
    .reduce((sum, f) => sum + f.gamma * f.volume, 0);
  
  const netGamma = callGamma - putGamma;
  const netDelta = flow.reduce((sum, f) => sum + f.delta * f.volume, 0);
  const netVega = flow.reduce((sum, f) => sum + f.vega * f.volume, 0);
  
  const totalGammaExposure = Math.abs(netGamma);
  
  // Determine regime
  const regime = netGamma > 1000 ? 'long_gamma' : netGamma < -1000 ? 'short_gamma' : 'neutral';
  
  // Calculate flip level (simplified - price where gamma changes sign)
  const strikes = flow.map(f => f.strike);
  const avgStrike = strikes.reduce((sum, s) => sum + s, 0) / strikes.length;
  const flipLevel = avgStrike;
  
  return {
    symbol,
    timestamp: Date.now(),
    netGamma,
    netDelta,
    netVega,
    callGamma,
    putGamma,
    totalGammaExposure,
    regime,
    flipLevel
  };
}

/**
 * Calculate options sentiment score
 */
export function calculateOptionsSentiment(flow: OptionsFlow[]): {
  score: number; // -100 to 100
  sentiment: 'bullish' | 'bearish' | 'neutral';
  callPutRatio: number;
  ivRank: number;
} {
  if (flow.length === 0) {
    return { score: 0, sentiment: 'neutral', callPutRatio: 1, ivRank: 50 };
  }
  
  const callVolume = flow.filter(f => f.optionType === 'call').reduce((sum, f) => sum + f.volume, 0);
  const putVolume = flow.filter(f => f.optionType === 'put').reduce((sum, f) => sum + f.volume, 0);
  
  const callPutRatio = putVolume > 0 ? callVolume / putVolume : callVolume > 0 ? 10 : 1;
  
  // Sentiment score based on put/call ratio and flow direction
  let score = 0;
  if (callPutRatio > 1.5) score = 50 + (callPutRatio - 1.5) * 20;
  else if (callPutRatio < 0.67) score = -50 - (0.67 - callPutRatio) * 20;
  else score = (callPutRatio - 1) * 50;
  
  // Cap at -100 to 100
  score = Math.max(-100, Math.min(100, score));
  
  const sentiment = score > 20 ? 'bullish' : score < -20 ? 'bearish' : 'neutral';
  
  // IV rank (simplified)
  const avgIV = flow.reduce((sum, f) => sum + f.iv, 0) / flow.length;
  const ivRank = Math.min(100, Math.max(0, (avgIV / 0.8) * 100));
  
  return { score, sentiment, callPutRatio, ivRank };
}

/**
 * Generate mock options flow data for testing
 */
export function generateMockOptionsFlow(symbol: string, count: number = 50): OptionsFlow[] {
  const flows: OptionsFlow[] = [];
  const sources: Array<'sweep' | 'block' | 'split' | 'retail'> = ['sweep', 'block', 'split', 'retail'];
  
  for (let i = 0; i < count; i++) {
    const isCall = Math.random() > 0.5;
    const strike = 100 + Math.floor(Math.random() * 50);
    const daysToExpiry = Math.floor(Math.random() * 60) + 1;
    const expiration = new Date(Date.now() + daysToExpiry * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const volume = Math.floor(Math.random() * 10000) + 100;
    const openInterest = Math.floor(Math.random() * 50000) + 1000;
    const iv = 0.15 + Math.random() * 0.5;
    const price = Math.random() * 10;
    
    // Simplified greeks calculation
    const delta = isCall ? 0.5 + Math.random() * 0.4 : -0.5 - Math.random() * 0.4;
    const gamma = Math.random() * 0.1;
    const vega = Math.random() * 0.5;
    const theta = -Math.random() * 0.1;
    
    const totalValue = volume * price * 100;
    
    flows.push({
      symbol,
      timestamp: Date.now() - Math.random() * 86400000,
      optionType: isCall ? 'call' : 'put',
      strike,
      expiration,
      volume,
      openInterest,
      iv,
      delta,
      gamma,
      vega,
      theta,
      price,
      totalValue,
      isUnusual: totalValue > 500000 || volume > openInterest * 5,
      sentiment: isCall ? 'bullish' : 'bearish',
      source: sources[Math.floor(Math.random() * sources.length)]
    });
  }
  
  return flows.sort((a, b) => b.timestamp - a.timestamp);
}
