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
    let mounted = true;
    
    async function fetchForecast() {
      try {
        const response = await fetch(`/api/forecasts/stocks/${symbol}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const forecastData = await response.json();
        
        if (mounted) {
          setData(forecastData);
        }
      } catch (err) {
        if (mounted) {
          console.error(`Error fetching ${symbol}:`, err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    fetchForecast();
    
    return () => {
      mounted = false;
    };
  }, [symbol]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">
          {error ? `Error: ${error}` : 'Forecast not available'}
        </p>
      </div>
    );
  }

  const expectedReturn = data.last_price > 0 
    ? ((data.forecast_mean - data.last_price) / data.last_price * 100).toFixed(2)
    : '0.00';
  const isPositive = parseFloat(expectedReturn) > 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{symbol}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{expectedReturn}%
          </p>
          <p className="text-xs text-gray-500">Expected Return</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Current Price:</span>
          <span className="text-gray-900">${data.last_price?.toFixed(2) || '--'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Forecast Mean:</span>
          <span className="text-gray-900">${data.forecast_mean?.toFixed(2) || '--'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Confidence:</span>
          <span className="text-gray-900">±${data.forecast_std?.toFixed(2) || '--'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Horizon:</span>
          <span className="text-gray-900">{data.horizon || '--'} days</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Updated: {data.last_updated ? new Date(data.last_updated).toLocaleDateString() : '--'}
        </p>
      </div>
    </div>
  );
}
