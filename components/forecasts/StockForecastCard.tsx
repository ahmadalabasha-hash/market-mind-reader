'use client';

import { useEffect, useState } from 'react';
import VolatilityCard from './VolatilityCard';
import ForecastChart from './ForecastChart';

type ModelType = 'timesfm' | 'simple-ensemble' | 'transformer';

interface ForecastHorizon {
  forecast: number[];
  horizon: number;
  forecast_mean: number;
  forecast_std: number;
  confidence_upper: number[];
  confidence_lower: number[];
}

interface ForecastData {
  symbol: string;
  type: string;
  historical: number[];
  last_price: number;
  forecasts?: Record<string, ForecastHorizon>;
  forecast?: number[];
  ensemble_forecast?: number[];
  forecast_mean?: number;
  forecast_std?: number;
  confidence_upper?: number[];
  confidence_lower?: number[];
  last_updated: string;
  model: string;
  model_weights?: Record<string, number>;
  models_used?: string[];
}

interface StockForecastCardProps {
  symbol: string;
  name: string;
  modelType?: ModelType;
}

export default function StockForecastCard({ symbol, name, modelType = 'timesfm' }: StockForecastCardProps) {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;
    
    async function fetchForecast() {
      try {
        let endpoint: string;
        
        // Determine the correct API endpoint based on model type
        if (modelType === 'timesfm') {
          endpoint = `/api/forecasts/stocks/${symbol}`;
        } else if (modelType === 'simple-ensemble') {
          endpoint = `/api/forecasts/simple-ensemble/${symbol}`;
        } else if (modelType === 'transformer') {
          endpoint = `/api/forecasts/transformer/${symbol}`;
        } else {
          endpoint = `/api/forecasts/stocks/${symbol}`;
        }
        
        console.log(`Fetching ${symbol} with modelType=${modelType} from endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const forecastData = await response.json();
        
        if (mounted) {
          setData(forecastData);
          setError(null);
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
    
    // Auto-refresh every 30 seconds for live data
    intervalId = setInterval(() => {
      if (mounted) {
        fetchForecast();
      }
    }, 30000);
    
    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [symbol, modelType]);

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

  // Handle different data structures for different models
  // TimesFM has forecasts with horizons, ensemble/transformer have single forecast array
  const isTimesFM = modelType === 'timesfm' && data.forecasts;
  
  let oneDayReturn = '0.00';
  let sevenDayReturn = '0.00';
  let thirtyDayReturn = '0.00';
  let oneDayTarget = '--';
  let sevenDayTarget = '--';
  let thirtyDayTarget = '--';

  if (isTimesFM && data.forecasts) {
    const oneDayForecast = data.forecasts["1"];
    const sevenDayForecast = data.forecasts["7"];
    const thirtyDayForecast = data.forecasts["30"];

    oneDayReturn = oneDayForecast && data.last_price > 0 
      ? ((oneDayForecast.forecast_mean - data.last_price) / data.last_price * 100).toFixed(2)
      : '0.00';
    sevenDayReturn = sevenDayForecast && data.last_price > 0 
      ? ((sevenDayForecast.forecast_mean - data.last_price) / data.last_price * 100).toFixed(2)
      : '0.00';
    thirtyDayReturn = thirtyDayForecast && data.last_price > 0 
      ? ((thirtyDayForecast.forecast_mean - data.last_price) / data.last_price * 100).toFixed(2)
      : '0.00';

    oneDayTarget = oneDayForecast?.forecast_mean?.toFixed(2) || '--';
    sevenDayTarget = sevenDayForecast?.forecast_mean?.toFixed(2) || '--';
    thirtyDayTarget = thirtyDayForecast?.forecast_mean?.toFixed(2) || '--';
  } else if (data.ensemble_forecast && data.forecast_mean) {
    // Simple ensemble has ensemble_forecast
    const forecastArray = data.ensemble_forecast;
    
    if (data.last_price > 0) {
      if (forecastArray.length >= 1) {
        oneDayReturn = ((forecastArray[0] - data.last_price) / data.last_price * 100).toFixed(2);
        oneDayTarget = forecastArray[0].toFixed(2);
      }
      if (forecastArray.length >= 7) {
        sevenDayReturn = ((forecastArray[6] - data.last_price) / data.last_price * 100).toFixed(2);
        sevenDayTarget = forecastArray[6].toFixed(2);
      }
      if (forecastArray.length >= 30) {
        thirtyDayReturn = ((forecastArray[29] - data.last_price) / data.last_price * 100).toFixed(2);
        thirtyDayTarget = forecastArray[29].toFixed(2);
      }
    }
  } else if (data.forecast && data.forecast_mean) {
    // Ensemble/Transformer models have single forecast
    const forecastArray = data.forecast;
    const mean = data.forecast_mean;
    
    if (data.last_price > 0) {
      // Calculate returns for different horizons from the forecast array
      if (forecastArray.length >= 1) {
        oneDayReturn = ((forecastArray[0] - data.last_price) / data.last_price * 100).toFixed(2);
        oneDayTarget = forecastArray[0].toFixed(2);
      }
      if (forecastArray.length >= 7) {
        sevenDayReturn = ((forecastArray[6] - data.last_price) / data.last_price * 100).toFixed(2);
        sevenDayTarget = forecastArray[6].toFixed(2);
      }
      if (forecastArray.length >= 30) {
        thirtyDayReturn = ((forecastArray[29] - data.last_price) / data.last_price * 100).toFixed(2);
        thirtyDayTarget = forecastArray[29].toFixed(2);
      }
    }
  }

  const isPositiveOneDay = parseFloat(oneDayReturn) > 0;
  const isPositiveSevenDay = parseFloat(sevenDayReturn) > 0;
  const isPositiveThirtyDay = parseFloat(thirtyDayReturn) > 0;

  return (
    <>
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600">{symbol}</p>
            <p className="text-xs text-blue-600 mt-1 capitalize">
              Model: {modelType === 'timesfm' ? 'TimesFM' : modelType}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">${data.last_price?.toFixed(2) || '--'}</p>
            <p className="text-xs text-gray-500">Current Price</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">1-Day</p>
            <p className={`text-lg font-bold ${isPositiveOneDay ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveOneDay ? '+' : ''}{oneDayReturn}%
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">7-Day</p>
            <p className={`text-lg font-bold ${isPositiveSevenDay ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveSevenDay ? '+' : ''}{sevenDayReturn}%
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">30-Day</p>
            <p className={`text-lg font-bold ${isPositiveThirtyDay ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveThirtyDay ? '+' : ''}{thirtyDayReturn}%
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">1-Day Target:</span>
            <span className="text-gray-900">${oneDayTarget}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">7-Day Target:</span>
            <span className="text-gray-900">${sevenDayTarget}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">30-Day Target:</span>
            <span className="text-gray-900">${thirtyDayTarget}</span>
          </div>
        </div>

        <div className="mt-4">
          <VolatilityCard symbol={symbol} />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowChart(true)}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            View Chart
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Updated: {data.last_updated ? new Date(data.last_updated).toLocaleTimeString() : '--'}
          </p>
          <div className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-600 font-medium">Live</span>
          </div>
        </div>
      </div>

      <ForecastChart
        symbol={symbol}
        isOpen={showChart}
        onClose={() => setShowChart(false)}
      />
    </>
  );
}
