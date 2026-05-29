'use client';

import { useEffect, useState } from 'react';

interface ForecastData {
  historical: number[];
  forecast: number[];
  last_updated: string;
  model: string;
}

export default function SimpleForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/forecast')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading forecast...</div>;
  if (!data) return <div className="p-8">No data available</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">TimesFM Forecast</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl mb-2">Historical</h2>
          {data.historical.map((v, i) => (
            <div key={i}>Month {i+1}: ${v}</div>
          ))}
        </div>
        <div>
          <h2 className="text-xl mb-2">Forecast</h2>
          {data.forecast.map((v, i) => (
            <div key={i}>Month {i+13}: ${v.toFixed(2)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
