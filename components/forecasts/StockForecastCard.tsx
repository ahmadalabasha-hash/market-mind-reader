'use client';

import { useEffect, useState } from 'react';

interface StockForecastCardProps {
  symbol: string;
  name: string;
}

export default function StockForecastCard({ symbol, name }: StockForecastCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">{symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">--</p>
          <p className="text-xs text-gray-500">Expected Return</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Current Price:</span>
          <span className="text-gray-900">--</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Forecast Mean:</span>
          <span className="text-gray-900">--</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className="text-gray-900">Loading...</span>
        </div>
      </div>
    </div>
  );
}
