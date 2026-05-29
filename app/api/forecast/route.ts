import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Read the forecast file from timesfm directory
    const filePath = path.join(process.cwd(), 'timesfm', 'forecast_output.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const forecastData = JSON.parse(fileContents);
    
    return Response.json(forecastData);
  } catch (error) {
    return Response.json({ error: 'Forecast not available' }, { status: 500 });
  }
}
