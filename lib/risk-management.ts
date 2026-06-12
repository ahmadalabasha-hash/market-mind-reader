/**
 * Risk Management Tools
 * Position sizing, stop-loss calculation, probability-based targets
 */

export interface PositionSize {
  symbol: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskPerTrade: number; // Percentage of account
  accountValue: number;
  shares: number;
  positionValue: number;
  maxLoss: number;
  maxGain: number;
  riskReward: number;
  positionSizePercent: number; // Percentage of account
}

export interface RiskMetrics {
  symbol: string;
  currentPrice: number;
  volatility: number;
  atr: number;
  recommendedStopLoss: number;
  recommendedTakeProfit: number;
  maxPositionSize: number; // Percentage of account
  kellyCriterion: number; // Optimal position size
  probabilityOfSuccess: number;
  expectedValue: number;
}

export interface ProbabilityTarget {
  price: number;
  probability: number; // 0-100
  timeHorizon: string;
  confidence: number; // 0-100
  type: 'conservative' | 'moderate' | 'aggressive';
}

/**
 * Calculate optimal position size using Kelly Criterion
 */
export function calculateKellyCriterion(
  winRate: number, // 0-1
  avgWin: number,
  avgLoss: number
): number {
  if (avgLoss === 0) return 0;
  
  const kelly = (winRate * avgWin - (1 - winRate) * avgLoss) / avgLoss;
  
  // Cap at 25% to prevent over-leveraging
  return Math.max(0, Math.min(0.25, kelly));
}

/**
 * Calculate position size based on risk per trade
 */
export function calculatePositionSize(
  accountValue: number,
  entryPrice: number,
  stopLoss: number,
  riskPerTrade: number = 0.02 // 2% default
): PositionSize {
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  const maxLoss = accountValue * riskPerTrade;
  const shares = Math.floor(maxLoss / riskPerShare);
  const positionValue = shares * entryPrice;
  const takeProfit = entryPrice + (entryPrice - stopLoss) * 2; // 2:1 risk-reward
  const maxGain = (takeProfit - entryPrice) * shares;
  const riskReward = Math.abs(takeProfit - entryPrice) / riskPerShare;
  const positionSizePercent = (positionValue / accountValue) * 100;

  return {
    symbol: '',
    entryPrice,
    stopLoss,
    takeProfit,
    riskPerTrade,
    accountValue,
    shares,
    positionValue,
    maxLoss,
    maxGain,
    riskReward,
    positionSizePercent
  };
}

/**
 * Calculate recommended stop loss based on ATR
 */
export function calculateStopLoss(
  currentPrice: number,
  atr: number,
  multiplier: number = 1.5
): number {
  return currentPrice - (atr * multiplier);
}

/**
 * Calculate recommended take profit based on risk-reward ratio
 */
export function calculateTakeProfit(
  entryPrice: number,
  stopLoss: number,
  riskRewardRatio: number = 2
): number {
  const risk = Math.abs(entryPrice - stopLoss);
  return entryPrice + (risk * riskRewardRatio);
}

/**
 * Calculate risk metrics for a symbol
 */
export function calculateRiskMetrics(
  symbol: string,
  currentPrice: number,
  volatility: number,
  atr: number,
  historicalWinRate: number = 0.5,
  historicalAvgWin: number = 100,
  historicalAvgLoss: number = 50
): RiskMetrics {
  const recommendedStopLoss = calculateStopLoss(currentPrice, atr, 1.5);
  const recommendedTakeProfit = calculateTakeProfit(currentPrice, recommendedStopLoss, 2);
  
  // Max position size based on volatility (higher volatility = smaller position)
  const maxPositionSize = Math.min(0.1, 0.05 / volatility); // Cap at 10%
  
  // Kelly criterion for optimal sizing
  const kellyCriterion = calculateKellyCriterion(
    historicalWinRate,
    historicalAvgWin,
    historicalAvgLoss
  );
  
  // Probability of success (simplified - based on volatility and trend)
  const probabilityOfSuccess = Math.max(0.3, Math.min(0.7, 0.5 - volatility * 0.5));
  
  // Expected value
  const expectedValue = (probabilityOfSuccess * historicalAvgWin) - 
                       ((1 - probabilityOfSuccess) * historicalAvgLoss);

  return {
    symbol,
    currentPrice,
    volatility,
    atr,
    recommendedStopLoss,
    recommendedTakeProfit,
    maxPositionSize,
    kellyCriterion,
    probabilityOfSuccess,
    expectedValue
  };
}

/**
 * Generate probability targets based on volatility and time horizon
 */
export function generateProbabilityTargets(
  currentPrice: number,
  volatility: number,
  timeHorizons: string[] = ['1d', '1w', '1m']
): ProbabilityTarget[] {
  const targets: ProbabilityTarget[] = [];
  
  timeHorizons.forEach(horizon => {
    const days = horizon === '1d' ? 1 : horizon === '1w' ? 7 : 30;
    const expectedMove = currentPrice * volatility * Math.sqrt(days);
    
    // Conservative target (1 standard deviation)
    targets.push({
      price: currentPrice + expectedMove,
      probability: 68,
      timeHorizon: horizon,
      confidence: 70,
      type: 'conservative'
    });
    
    // Moderate target (1.5 standard deviations)
    targets.push({
      price: currentPrice + expectedMove * 1.5,
      probability: 50,
      timeHorizon: horizon,
      confidence: 60,
      type: 'moderate'
    });
    
    // Aggressive target (2 standard deviations)
    targets.push({
      price: currentPrice + expectedMove * 2,
      probability: 32,
      timeHorizon: horizon,
      confidence: 50,
      type: 'aggressive'
    });
    
    // Downside targets
    targets.push({
      price: currentPrice - expectedMove,
      probability: 68,
      timeHorizon: horizon,
      confidence: 70,
      type: 'conservative'
    });
    
    targets.push({
      price: currentPrice - expectedMove * 1.5,
      probability: 50,
      timeHorizon: horizon,
      confidence: 60,
      type: 'moderate'
    });
    
    targets.push({
      price: currentPrice - expectedMove * 2,
      probability: 32,
      timeHorizon: horizon,
      confidence: 50,
      type: 'aggressive'
    });
  });
  
  return targets;
}

/**
 * Calculate portfolio risk
 */
export interface PortfolioRisk {
  totalValue: number;
  totalRisk: number;
  riskPerPosition: number;
  maxDrawdown: number;
  diversificationScore: number; // 0-100
  correlationRisk: number;
  recommendations: string[];
}

export function calculatePortfolioRisk(
  positions: Array<{ symbol: string; value: number; stopLoss: number; currentPrice: number }>,
  accountValue: number
): PortfolioRisk {
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const totalRisk = positions.reduce((sum, p) => {
    const riskPerShare = Math.abs(p.currentPrice - p.stopLoss);
    const shares = p.value / p.currentPrice;
    return sum + (riskPerShare * shares);
  }, 0);
  
  const riskPerPosition = totalRisk / positions.length;
  const maxDrawdown = (totalRisk / accountValue) * 100;
  
  // Simplified diversification score (based on number of positions)
  const diversificationScore = Math.min(100, positions.length * 20);
  
  // Correlation risk (simplified - assumes some correlation)
  const correlationRisk = positions.length > 5 ? 0.3 : 0.6;
  
  const recommendations: string[] = [];
  if (maxDrawdown > 10) recommendations.push('Reduce total portfolio risk - current drawdown risk is high');
  if (diversificationScore < 60) recommendations.push('Increase diversification - add more uncorrelated positions');
  if (riskPerPosition > accountValue * 0.02) recommendations.push('Reduce position sizes - individual position risk exceeds 2%');
  if (positions.length < 5) recommendations.push('Add more positions to improve diversification');
  
  return {
    totalValue,
    totalRisk,
    riskPerPosition,
    maxDrawdown,
    diversificationScore,
    correlationRisk,
    recommendations
  };
}

/**
 * Generate mock risk metrics
 */
export function generateMockRiskMetrics(symbol: string): RiskMetrics {
  const currentPrice = 100 + Math.random() * 50;
  const volatility = 0.15 + Math.random() * 0.3;
  const atr = currentPrice * volatility * 0.02;
  
  return {
    symbol,
    currentPrice,
    volatility,
    atr,
    recommendedStopLoss: calculateStopLoss(currentPrice, atr, 1.5),
    recommendedTakeProfit: calculateTakeProfit(currentPrice, calculateStopLoss(currentPrice, atr, 1.5), 2),
    maxPositionSize: Math.min(0.1, 0.05 / volatility),
    kellyCriterion: calculateKellyCriterion(0.5 + Math.random() * 0.2, 100, 50),
    probabilityOfSuccess: 0.4 + Math.random() * 0.3,
    expectedValue: (0.5 + Math.random() * 0.2) * 100 - (0.5 - Math.random() * 0.2) * 50
  };
}
