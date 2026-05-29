import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'timesfm', 'forecasts', 'sector_rotation_forecast.json');
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Sector rotation forecast not found' },
        { status: 404 }
      );
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const forecastData = JSON.parse(fileContents);
    
    return NextResponse.json(forecastData);
  } catch (error) {
    console.error('Forecast error:', error);
    return NextResponse.json(
      { error: 'Failed to load sector forecast' },
      { status: 500 }
    );
  }
}
