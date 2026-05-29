'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastData {
  historical: number[];
  forecast: number[];
  last_updated: string;
  model: string;
}

export default function ForecastChart() {
  const [data, setData] = useState<ForecastData | null>(null);

  useEffect(() => {
    fetch('/api/forecast')
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-4">Loading chart...</div>;

  // Combine historical and forecast for chart
  const chartData = [];
  for (let i = 0; i < data.historical.length; i++) {
    chartData.push({ month: i + 1, historical: data.historical[i], forecast: null });
  }
  for (let i = 0; i < data.forecast.length; i++) {
    chartData.push({ month: i + 13, historical: null, forecast: data.forecast[i] });
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">TimesFM Forecast Visualization</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" label={{ value: 'Month', position: 'bottom' }} />
          <YAxis label={{ value: 'Sales ($)', angle: -90, position: 'left' }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="historical" stroke="#8884d8" name="Historical" />
          <Line type="monotone" dataKey="forecast" stroke="#82ca9d" name="Forecast" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-sm text-gray-600 mt-4">
        Model: {data.model} | Updated: {new Date(data.last_updated).toLocaleString()}
      </p>
    </div>
  );
}
