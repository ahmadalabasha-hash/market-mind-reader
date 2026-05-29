import fs from 'fs';
import path from 'path';

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

export default async function SimpleForecastPage() {
  const data = await getForecastData();

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
