'use client';

import { useEffect, useState } from 'react';

interface SectorData {
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

interface SectorRotationData {
  type: string;
  sectors: string[];
  forecasts: Record<string, SectorData>;
}

const SECTOR_NAMES: Record<string, string> = {
  XLK: 'Technology',
  XLV: 'Healthcare',
  XLU: 'Utilities',
  XLI: 'Industrials',
  XLF: 'Financials',
  XLE: 'Energy'
};

export default function SectorRotationCard() {
  const [data, setData] = useState<SectorRotationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function fetchSectorData() {
      try {
        const response = await fetch('/api/forecasts/sectors');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const sectorData = await response.json();
        
        if (mounted) {
          setData(sectorData);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error fetching sector data:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    
    fetchSectorData();
    
    return () => {
      mounted = false;
    };
  }, []);

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
          {error ? `Error: ${error}` : 'Sector data not available'}
        </p>
      </div>
    );
  }

  // Calculate expected returns for each sector
  const sectorReturns = Object.entries(data.forecasts).map(([symbol, forecast]) => {
    const expectedReturn = forecast.last_price > 0 
      ? ((forecast.forecast_mean - forecast.last_price) / forecast.last_price * 100).toFixed(2)
      : '0.00';
    return {
      symbol,
      name: SECTOR_NAMES[symbol] || symbol,
      expectedReturn: parseFloat(expectedReturn),
      lastPrice: forecast.last_price
    };
  }).sort((a, b) => b.expectedReturn - a.expectedReturn);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Rotation Analysis</h3>
      
      <div className="space-y-3">
        {sectorReturns.map((sector) => {
          const isPositive = sector.expectedReturn > 0;
          return (
            <div key={sector.symbol} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                  {sector.symbol}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{sector.name}</p>
                  <p className="text-xs text-gray-500">${sector.lastPrice?.toFixed(2) || '--'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}{sector.expectedReturn.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500">30-Day Forecast</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Based on TimesFM predictions for sector ETFs
        </p>
      </div>
    </div>
  );
}
