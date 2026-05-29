'use client';

import { useEffect, useState } from 'react';

interface VolatilityData {
  symbol: string;
  historical_volatility: number;
  forecast_volatility: number;
  volatility_trend: 'increasing' | 'decreasing' | 'stable';
  last_updated: string;
}

export default function VolatilityCard({ symbol }: { symbol: string }) {
  const [data, setData] = useState<VolatilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchVolatilityData() {
      try {
        // Calculate volatility from forecast data
        const response = await fetch(`/api/forecasts/stocks/${symbol}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const forecastData = await response.json();
        
        if (mounted && forecastData && forecastData.forecasts) {
          // Calculate historical volatility from historical prices
          const historical = forecastData.historical || [];
          const historicalVolatility = calculateVolatility(historical);
          
          // Use 7-day forecast volatility
          const sevenDayForecast = forecastData.forecasts["7"];
          const forecastVolatility = sevenDayForecast?.forecast_std || 0;
          
          // Determine trend
          let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
          const change = ((forecastVolatility - historicalVolatility) / historicalVolatility) * 100;
          if (change > 5) trend = 'increasing';
          else if (change < -5) trend = 'decreasing';
          
          setData({
            symbol,
            historical_volatility: historicalVolatility,
            forecast_volatility: forecastVolatility,
            volatility_trend: trend,
            last_updated: forecastData.last_updated || new Date().toISOString()
          });
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching volatility data:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    fetchVolatilityData();
    
    return () => {
      mounted = false;
    };
  }, [symbol]);

  function calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    // Calculate daily returns
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    // Calculate standard deviation of returns
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
    
    // Annualize (assuming 252 trading days)
    return Math.sqrt(variance) * Math.sqrt(252) * 100;
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-500">
          {error ? `Error: ${error}` : 'Volatility data not available'}
        </p>
      </div>
    );
  }

  const trendColors = {
    increasing: 'text-red-600 bg-red-50',
    decreasing: 'text-green-600 bg-green-50',
    stable: 'text-gray-600 bg-gray-50'
  };

  const trendIcons = {
    increasing: '↑',
    decreasing: '↓',
    stable: '→'
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">7-Day Volatility</p>
          <p className="text-lg font-bold text-gray-900">
            {data.forecast_volatility.toFixed(2)}%
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${trendColors[data.volatility_trend]}`}>
          {trendIcons[data.volatility_trend]} {data.volatility_trend}
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Historical: {data.historical_volatility.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}
