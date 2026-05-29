import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import fs from 'fs';
import path from 'path';
import { verifySessionToken } from "@/lib/auth";
import { SESSION_COOKIE_NAME, getUserTier, hasUltimateAccess } from "@/lib/auth-types";

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
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    redirect("/auth");
  }

  const userTier = getUserTier(session);
  const isSuperAdmin = session?.isSuperAdmin || false;

  // Access control: Only Ultimate users can access forecast
  if (!hasUltimateAccess(userTier, isSuperAdmin)) {
    redirect("/pricing");
  }

  const data = await getForecastData();

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-lg">No forecast data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">TimesFM Sales Forecast</h1>
          <p className="text-gray-600 mt-2">
            AI-powered time series forecasting by Google
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Model:</strong> {data.model} | 
            <strong> Last updated:</strong> {new Date(data.last_updated).toLocaleString()}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
