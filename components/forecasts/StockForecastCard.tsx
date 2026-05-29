'use client';

import { useEffect, useState } from 'react';

interface ForecastData {
  symbol: string;
  type: string;
  historical: number[];
  forecast: number[];
  horizon: number;
  last_price: number;
  forecast_mean: number;
  forecast_std: number;
  confidence_upper: number[];
  confidence_lower: number[];
  last_updated: string;
  model: string;
}

interface StockForecastCardProps {
  symbol: string;
  name: string;
}

export default function StockForecastCard({ symbol, name }: StockForecastCardProps) {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForecast() {
      try {
        const response = await fetch(`/api/forecasts/stocks/${symbol}`);
        if (!response.ok) throw new Error('Failed to fetch forecast');
        const forecastData = await response.json();
        setData(forecastData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchForecast();
  }, [symbol]);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/30 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-zinc-700 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-zinc-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/30 p-6">
        <p className="text-sm text-zinc-500">Forecast not available</p>
      </div>
    );
  }

  const expectedReturn = ((data.forecast_mean - data.last_price) / data.last_price * 100).toFixed(2);
  const isPositive = parseFloat(expectedReturn) > 0;

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">{name}</h3>
          <p className="text-sm text-zinc-400">{symbol}</p>
        </div>
        <div className={`text-right`}>
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '+' : ''}{expectedReturn}%
          </p>
          <p className="text-xs text-zinc-500">Expected Return</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-400">Current Price:</span>
          <span className="text-zinc-100">${data.last_price.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Forecast Mean:</span>
          <span className="text-zinc-100">${data.forecast_mean.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Confidence:</span>
          <span className="text-zinc-100">±${data.forecast_std.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-400">Horizon:</span>
          <span className="text-zinc-100">{data.horizon} days</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-700">
        <p className="text-xs text-zinc-500">
          Updated: {new Date(data.last_updated).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
