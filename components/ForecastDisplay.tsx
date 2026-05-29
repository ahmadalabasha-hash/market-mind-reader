'use client';

import { useEffect, useState } from 'react';

interface ForecastData {
  historical: number[];
  forecast: number[];
  last_updated: string;
  model: string;
}

export default function ForecastDisplay() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForecast() {
      try {
        const response = await fetch('/api/forecast');
        if (!response.ok) throw new Error('Failed to fetch');
        const forecastData = await response.json();
        setData(forecastData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchForecast();
  }, []);

  if (loading) return <div className="p-4">Loading forecast...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">TimesFM Sales Forecast</h2>
      <p className="text-sm text-gray-600 mb-4">
        Model: {data.model} | Last updated: {new Date(data.last_updated).toLocaleString()}
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Historical Data (12 months)</h3>
          <div className="space-y-1">
            {data.historical.map((value, i) => (
              <div key={i} className="text-sm">
                Month {i + 1}: ${value}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Forecast (next 12 months)</h3>
          <div className="space-y-1">
            {data.forecast.map((value, i) => (
              <div key={i} className="text-sm text-blue-600">
                Month {i + 13}: ${value.toFixed(2)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
