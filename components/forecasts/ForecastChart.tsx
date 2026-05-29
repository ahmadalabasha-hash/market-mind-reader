'use client';

import { useEffect, useState, useRef } from 'react';

interface ForecastData {
  symbol: string;
  historical: number[];
  forecast: number[];
  confidence_upper: number[];
  confidence_lower: number[];
  last_price: number;
  forecast_mean: number;
  last_updated: string;
}

interface ForecastChartProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ForecastChart({ symbol, isOpen, onClose }: ForecastChartProps) {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchData() {
      try {
        const response = await fetch(`/api/forecasts/stocks/${symbol}`);
        if (response.ok) {
          const forecastData = await response.json();
          setData(forecastData);
        }
      } catch (err) {
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isOpen, symbol]);

  useEffect(() => {
    if (!isOpen || !data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Combine historical and forecast data
    const allData = [...data.historical, ...data.forecast];
    const minPrice = Math.min(...allData) * 0.98;
    const maxPrice = Math.max(...allData) * 1.02;
    const priceRange = maxPrice - minPrice;

    const padding = { top: 40, right: 60, bottom: 40, left: 60 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(2)}`, padding.left - 10, y + 4);
    }

    // Vertical grid lines
    const totalPoints = allData.length;
    const historicalPoints = data.historical.length;
    for (let i = 0; i <= 10; i++) {
      const x = padding.left + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, rect.height - padding.bottom);
      ctx.stroke();
    }

    // Helper function to convert data point to coordinates
    const toCoords = (index: number, price: number) => {
      const x = padding.left + (index / (totalPoints - 1)) * chartWidth;
      const y = padding.top + ((maxPrice - price) / priceRange) * chartHeight;
      return { x, y };
    };

    // Draw confidence interval
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.beginPath();
    
    // Upper bound
    for (let i = 0; i < data.forecast.length; i++) {
      const point = toCoords(historicalPoints + i, data.confidence_upper[i]);
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    
    // Lower bound (reverse)
    for (let i = data.forecast.length - 1; i >= 0; i--) {
      const point = toCoords(historicalPoints + i, data.confidence_lower[i]);
      ctx.lineTo(point.x, point.y);
    }
    
    ctx.closePath();
    ctx.fill();

    // Draw historical line
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data.historical.length; i++) {
      const point = toCoords(i, data.historical[i]);
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();

    // Draw forecast line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data.forecast.length; i++) {
      const point = toCoords(historicalPoints + i, data.forecast[i]);
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();

    // Draw current price line
    const currentPoint = toCoords(historicalPoints - 1, data.last_price);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, currentPoint.y);
    ctx.lineTo(rect.width - padding.right, currentPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw current price label
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`$${data.last_price.toFixed(2)}`, rect.width - padding.right + 5, currentPoint.y + 4);

    // Draw forecast mean line
    const forecastPoint = toCoords(historicalPoints + data.forecast.length - 1, data.forecast_mean);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, forecastPoint.y);
    ctx.lineTo(rect.width - padding.right, forecastPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw forecast mean label
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`$${data.forecast_mean.toFixed(2)}`, rect.width - padding.right + 5, forecastPoint.y + 4);

    // Draw legend
    const legendY = 20;
    ctx.font = '12px system-ui';
    
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(10, legendY - 8, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.textAlign = 'left';
    ctx.fillText('Historical', 35, legendY);

    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(100, legendY - 8, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.fillText('Forecast', 125, legendY);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.fillRect(190, legendY - 8, 20, 3);
    ctx.fillStyle = '#374151';
    ctx.fillText('Confidence', 215, legendY);

  }, [isOpen, data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{symbol} Price Forecast</h2>
            <p className="text-sm text-gray-500">
              Historical data + 30-day forecast with confidence intervals
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="h-[500px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : data ? (
            <div className="h-[500px]">
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ) : (
            <div className="h-[500px] flex items-center justify-center">
              <p className="text-gray-500">Failed to load chart data</p>
            </div>
          )}
        </div>

        {data && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Current Price</p>
                <p className="font-semibold text-gray-900">${data.last_price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Forecast Mean</p>
                <p className="font-semibold text-blue-600">${data.forecast_mean.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500">Expected Return</p>
                <p className={`font-semibold ${((data.forecast_mean - data.last_price) / data.last_price * 100) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {((data.forecast_mean - data.last_price) / data.last_price * 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p className="font-semibold text-gray-900">{new Date(data.last_updated).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
