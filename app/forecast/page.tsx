import fs from 'fs';
import path from 'path';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ForecastData {
  historical: number[];
  forecast: number[];
  last_updated: string;
  model: string;
}

async function getForecastData(): Promise<ForecastData | null> {
  try {
    const filePath = path.join(process.cwd(), 'timesfm', 'forecast_output.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    return null;
  }
}

export default async function ForecastPage() {
  const data = await getForecastData();

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">No forecast data available</div>
      </div>
    );
  }

  // Prepare data for chart
  const chartData = [];
  for (let i = 0; i < data.historical.length; i++) {
    chartData.push({ 
      month: `Month ${i + 1}`, 
      historical: data.historical[i], 
      forecast: null 
    });
  }
  for (let i = 0; i < data.forecast.length; i++) {
    chartData.push({ 
      month: `Month ${i + 13}`, 
      historical: null, 
      forecast: data.forecast[i] 
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">TimesFM Sales Forecast</h1>
          <p className="text-gray-600 mt-2">
            AI-powered time series forecasting by Google
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Model Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Model:</strong> {data.model} | 
            <strong> Last updated:</strong> {new Date(data.last_updated).toLocaleString()}
          </p>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Forecast Visualization</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                angle={-45} 
                textAnchor="end" 
                height={80} 
                interval={2}
              />
              <YAxis label={{ value: 'Sales ($)', angle: -90, position: 'left' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="historical" 
                stroke="#3b82f6" 
                name="Historical Sales"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#10b981" 
                name="Forecast"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Data Tables */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Historical Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Historical Data</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.historical.map((value, i) => (
                <div key={i} className="flex justify-between py-2 border-b">
                  <span className="font-medium">Month {i + 1}</span>
                  <span>${value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">12-Month Forecast</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {data.forecast.map((value, i) => (
                <div key={i} className="flex justify-between py-2 border-b">
                  <span className="font-medium">Month {i + 13}</span>
                  <span className="text-green-600 font-semibold">${value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
