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

export default async function SimpleForecastPage() {
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
