'use client';

import { useState, useEffect } from 'react';
import { AdvancedChart } from '@/components/dashboard/trading-view-section';
import { GammaLevelsOverlay } from '@/components/dashboard/gamma-levels-overlay';
import { fetchGammaSheetLevels } from '@/lib/gamma-sheet';

interface IntradayForecast {
  symbol: string;
  currentPrice: number;
  horizon: '1h' | '4h' | '1d';
  targetPrice: number;
  confidence: number;
  probabilityUp: number;
  probabilityDown: number;
  expectedMove: number;
  riskReward: number;
  stopLoss: number;
  takeProfit: number;
  indicators: {
    rsi: number;
    macd: number;
    bollingerUpper: number;
    bollingerLower: number;
    volumeTrend: string;
    momentum: string;
  };
  signals: string[];
}

interface OptionsFlowData {
  symbol: string;
  unusualActivity: any[];
  dealerPositioning: {
    netGamma: number;
    regime: string;
    flipLevel: number;
  };
  sentiment: {
    score: number;
    sentiment: string;
    callPutRatio: number;
    ivRank: number;
  };
}

interface ShortSentimentData {
  shortInterest: {
    shortRatio: number;
    shortPercentOfFloat: number;
    shortInterestChange: number;
  };
  shortSqueezeAlert: any;
  overallSentiment: {
    score: number;
    sentiment: string;
    confidence: number;
  };
}

interface RiskMetricsData {
  riskMetrics: {
    currentPrice: number;
    volatility: number;
    atr: number;
    recommendedStopLoss: number;
    recommendedTakeProfit: number;
    maxPositionSize: number;
    kellyCriterion: number;
    probabilityOfSuccess: number;
  };
  probabilityTargets: any[];
}

export default function DayTradingPage() {
  const [symbol, setSymbol] = useState('AAPL');
  const [selectedHorizon, setSelectedHorizon] = useState<'1h' | '4h' | '1d'>('1h');
  const [forecast, setForecast] = useState<IntradayForecast | null>(null);
  const [optionsFlow, setOptionsFlow] = useState<OptionsFlowData | null>(null);
  const [shortSentiment, setShortSentiment] = useState<ShortSentimentData | null>(null);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableSymbols, setAvailableSymbols] = useState<string[]>([]);

  useEffect(() => {
    // Load available symbols from gamma sheet
    fetchGammaSheetLevels().then(levels => {
      const symbols = Object.keys(levels);
      setAvailableSymbols(symbols);
      if (symbols.length > 0 && !symbols.includes(symbol)) {
        setSymbol(symbols[0]);
      }
    }).catch(err => {
      console.error('Failed to load gamma symbols:', err);
      // Fallback to default symbols
      setAvailableSymbols(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX', 'AMD', 'SPY', 'QQQ', 'IWM']);
    });
  }, []);

  useEffect(() => {
    if (symbol) {
      loadDayTradingData();
    }
  }, [symbol, selectedHorizon]);

  const loadDayTradingData = async () => {
    setLoading(true);
    try {
      // Load intraday forecast
      const forecastRes = await fetch(`/api/day-trading/intraday-forecast/${symbol}?horizon=${selectedHorizon}`);
      if (forecastRes.ok) {
        const forecastData = await forecastRes.json();
        setForecast(forecastData);
      }

      // Load options flow
      const optionsRes = await fetch(`/api/day-trading/options-flow/${symbol}`);
      if (optionsRes.ok) {
        const optionsData = await optionsRes.json();
        setOptionsFlow(optionsData);
      }

      // Load short sentiment
      const shortRes = await fetch(`/api/day-trading/short-sentiment/${symbol}`);
      if (shortRes.ok) {
        const shortData = await shortRes.json();
        setShortSentiment(shortData);
      }

      // Load risk metrics
      const riskRes = await fetch(`/api/day-trading/risk-metrics/${symbol}?price=${forecast?.currentPrice || 150}`);
      if (riskRes.ok) {
        const riskData = await riskRes.json();
        setRiskMetrics(riskData);
      }
    } catch (error) {
      console.error('Error loading day trading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const popularSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX', 'AMD', 'SPY', 'QQQ', 'IWM'
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Day Trading Dashboard</h1>
              <p className="text-sm text-gray-400">Real-time signals, options flow, and risk management</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm"
              >
                {availableSymbols.length > 0 ? (
                  availableSymbols.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))
                ) : (
                  <option value="AAPL">AAPL</option>
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Chart Section */}
        <div className="mb-6">
          <GammaLevelsOverlay theme="midnight" symbol={symbol} onSymbolChange={setSymbol} />
          <div className="h-[500px] rounded-xl border border-gray-800 bg-gray-900">
            <AdvancedChart symbol={symbol} onSymbolChange={setSymbol} />
          </div>
        </div>

        {/* Forecast Controls */}
        <div className="mb-6 flex gap-2">
          {(['1h', '4h', '1d'] as const).map(horizon => (
            <button
              key={horizon}
              onClick={() => setSelectedHorizon(horizon)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedHorizon === horizon
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {horizon === '1h' ? '1 Hour' : horizon === '4h' ? '4 Hours' : '1 Day'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading day trading data...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Intraday Forecast */}
            {forecast && (
              <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-6">
                <h2 className="mb-4 text-lg font-semibold">Intraday Forecast ({selectedHorizon})</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Price</span>
                    <span className="font-mono font-bold">${forecast.currentPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target Price</span>
                    <span className={`font-mono font-bold ${forecast.targetPrice > forecast.currentPrice ? 'text-green-400' : 'text-red-400'}`}>
                      ${forecast.targetPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Expected Move</span>
                    <span className="font-mono">${forecast.expectedMove.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confidence</span>
                    <span className="font-mono">{forecast.confidence.toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Risk/Reward</span>
                    <span className="font-mono">{forecast.riskReward.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stop Loss</span>
                    <span className="font-mono text-red-400">${forecast.stopLoss.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Take Profit</span>
                    <span className="font-mono text-green-400">${forecast.takeProfit.toFixed(2)}</span>
                  </div>
                  
                  {/* Probability Bar */}
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-green-400">Up: {forecast.probabilityUp.toFixed(0)}%</span>
                      <span className="text-red-400">Down: {forecast.probabilityDown.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-green-500"
                        style={{ width: `${forecast.probabilityUp}%` }}
                      />
                    </div>
                  </div>

                  {/* Signals */}
                  {forecast.signals.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-semibold text-gray-300">Signals</div>
                      {forecast.signals.map((signal, i) => (
                        <div key={i} className="rounded-lg bg-blue-900/30 px-3 py-2 text-sm text-blue-300">
                          {signal}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Indicators */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-gray-700/50 px-3 py-2">
                      <div className="text-gray-400">RSI</div>
                      <div className="font-mono font-bold">{forecast.indicators.rsi.toFixed(1)}</div>
                    </div>
                    <div className="rounded-lg bg-gray-700/50 px-3 py-2">
                      <div className="text-gray-400">MACD</div>
                      <div className="font-mono font-bold">{forecast.indicators.macd.toFixed(3)}</div>
                    </div>
                    <div className="rounded-lg bg-gray-700/50 px-3 py-2">
                      <div className="text-gray-400">Volume</div>
                      <div className="font-mono font-bold capitalize">{forecast.indicators.volumeTrend}</div>
                    </div>
                    <div className="rounded-lg bg-gray-700/50 px-3 py-2">
                      <div className="text-gray-400">Momentum</div>
                      <div className="font-mono font-bold capitalize">{forecast.indicators.momentum}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Options Flow */}
            {optionsFlow && (
              <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-6">
                <h2 className="mb-4 text-lg font-semibold">Options Flow</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sentiment</span>
                    <span className={`font-bold ${optionsFlow.sentiment.sentiment === 'bullish' ? 'text-green-400' : optionsFlow.sentiment.sentiment === 'bearish' ? 'text-red-400' : 'text-gray-400'}`}>
                      {optionsFlow.sentiment.sentiment.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sentiment Score</span>
                    <span className="font-mono font-bold">{optionsFlow.sentiment.score.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Put/Call Ratio</span>
                    <span className="font-mono">{optionsFlow.sentiment.callPutRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">IV Rank</span>
                    <span className="font-mono">{optionsFlow.sentiment.ivRank.toFixed(0)}%</span>
                  </div>
                  
                  {/* Dealer Positioning */}
                  <div className="mt-4 rounded-lg bg-gray-700/50 p-4">
                    <div className="mb-2 text-sm font-semibold text-gray-300">Dealer Positioning</div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Net Gamma</span>
                      <span className={`font-mono ${optionsFlow.dealerPositioning.netGamma > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {optionsFlow.dealerPositioning.netGamma.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Regime</span>
                      <span className="font-mono capitalize">{optionsFlow.dealerPositioning.regime.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GEX Flip Level</span>
                      <span className="font-mono">${optionsFlow.dealerPositioning.flipLevel.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Unusual Activity */}
                  {optionsFlow.unusualActivity.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="text-sm font-semibold text-gray-300">Unusual Activity</div>
                      {optionsFlow.unusualActivity.slice(0, 3).map((activity, i) => (
                        <div
                          key={i}
                          className={`rounded-lg px-3 py-2 text-sm ${
                            activity.impact === 'high' ? 'bg-red-900/30 text-red-300' : 'bg-yellow-900/30 text-yellow-300'
                          }`}
                        >
                          {activity.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Short Sentiment */}
            {shortSentiment && (
              <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-6">
                <h2 className="mb-4 text-lg font-semibold">Short Interest & Sentiment</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Short Ratio</span>
                    <span className="font-mono font-bold">{shortSentiment.shortInterest.shortRatio.toFixed(1)} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Short % of Float</span>
                    <span className="font-mono">{shortSentiment.shortInterest.shortPercentOfFloat.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Short Interest Change</span>
                    <span className={`font-mono ${shortSentiment.shortInterest.shortInterestChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {shortSentiment.shortInterest.shortInterestChange > 0 ? '+' : ''}{shortSentiment.shortInterest.shortInterestChange.toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Overall Sentiment */}
                  <div className="mt-4 rounded-lg bg-gray-700/50 p-4">
                    <div className="mb-2 text-sm font-semibold text-gray-300">Overall Sentiment</div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Score</span>
                      <span className={`font-mono font-bold ${shortSentiment.overallSentiment.sentiment === 'bullish' ? 'text-green-400' : shortSentiment.overallSentiment.sentiment === 'bearish' ? 'text-red-400' : 'text-gray-400'}`}>
                        {shortSentiment.overallSentiment.score.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence</span>
                      <span className="font-mono">{shortSentiment.overallSentiment.confidence.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Short Squeeze Alert */}
                  {shortSentiment.shortSqueezeAlert && (
                    <div className="mt-4 rounded-lg bg-red-900/30 p-4">
                      <div className="mb-2 text-sm font-semibold text-red-300">Short Squeeze Alert</div>
                      <div className="text-sm text-red-200">{shortSentiment.shortSqueezeAlert.description}</div>
                      <div className="mt-2 text-xs text-red-300">
                        Severity: {shortSentiment.shortSqueezeAlert.severity.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Risk Metrics */}
            {riskMetrics && (
              <div className="rounded-xl border border-gray-800 bg-gray-800/50 p-6">
                <h2 className="mb-4 text-lg font-semibold">Risk Management</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Volatility</span>
                    <span className="font-mono">{(riskMetrics.riskMetrics.volatility * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ATR</span>
                    <span className="font-mono">${riskMetrics.riskMetrics.atr.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Position Size</span>
                    <span className="font-mono">{(riskMetrics.riskMetrics.maxPositionSize * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Kelly Criterion</span>
                    <span className="font-mono">{(riskMetrics.riskMetrics.kellyCriterion * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Success Probability</span>
                    <span className="font-mono">{(riskMetrics.riskMetrics.probabilityOfSuccess * 100).toFixed(0)}%</span>
                  </div>
                  
                  {/* Recommended Levels */}
                  <div className="mt-4 rounded-lg bg-gray-700/50 p-4">
                    <div className="mb-2 text-sm font-semibold text-gray-300">Recommended Levels</div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stop Loss</span>
                      <span className="font-mono text-red-400">${riskMetrics.riskMetrics.recommendedStopLoss.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Take Profit</span>
                      <span className="font-mono text-green-400">${riskMetrics.riskMetrics.recommendedTakeProfit.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Probability Targets */}
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-semibold text-gray-300">Probability Targets</div>
                    {riskMetrics.probabilityTargets.slice(0, 4).map((target, i) => (
                      <div key={i} className="flex justify-between rounded-lg bg-gray-700/50 px-3 py-2 text-sm">
                        <span className="text-gray-400">
                          {target.type} ({target.timeHorizon})
                        </span>
                        <div className="text-right">
                          <span className="font-mono">${target.price.toFixed(2)}</span>
                          <span className="ml-2 text-gray-400">{target.probability.toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
